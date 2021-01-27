/* 
 * BulbaBot, BulbaGarden's own Discord bot
 * @author Justin Folvarcik
 */

// Get our variables
const config = require('./config.json');
// Initialize the Discord class
const Discord = require('discord.js');
const client = new Discord.Client();

// Initialize sequelize for our DB connections
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const Op = Sequelize.Op;

const ModLogs = require('./includes/sqlModLogs.js');
const Mutes = require('./includes/sqlMutes.js');
const Blacklist = require("./includes/sqlBlacklist.js");

const ListenerResponses = require("./responses/listenerResponses.js");

// Prepare to get our commands.
// Commands are stored in individual files in the ./commands/ directory
const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Get our commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // Register the command under client.commands.commandname
    client.commands.set(command.name, command);
}
// client.commands now contains an object with all of our commands

// Log start time
client.once('ready', async () => {
        const guild = await client.guilds.fetch(config.guildID);
        const logChan = guild.channels.resolve(config.logChannel);
        console.log("Start time logged");
        if (config.updateAvatar)
            await client.user.setAvatar(config.updateAvatar).catch(err => {
                console.log(err);
                logChan.send(ListenerResponses.apiError("Failed to update avatar. Did you provide an invalid URL?"))
                    .catch(err => console.log(err));
            });
        const avatarUpdated = config.updateAvatar ? ListenerResponses.avatarUpdated : false;

        logChan.send(ListenerResponses.startUp);
        if (avatarUpdated)
            logChan.send(avatarUpdated);

        return checkMutes(logChan);
    }
);


// Listen for commands
client.on('message', async message => {
    const anHourAgo = Date.now() - (1000*60*60);
    const text = message.content.toLowerCase();
    const blacklist = [
        ".net",
        ".com",
        ".info",
        ".co.uk"
    ];
    // Temp fix for spam.
    if (message.member.joinedAt > anHourAgo && (text.includes("axieinfinity") || text.includes("uniswap") || text.includes("airdrop") || text.includes("http") || blacklist.includes(text) ))
        return message.delete();
    const guild = await message.client.guilds.fetch(config.guildID);
    const logChan = guild.channels.resolve(config.logChannel);
    if (config.mentionLimit && message.mentions.members?.size >= config.mentionLimit) {
        await message.delete().catch(err => console.log(err));

        logChan.send(ListenerResponses.apiError("I was unable to delete a message with too many mentions in " + message.channel.toString()
            + ". Are my permissions not set correctly?"));
        message.author.send(ListenerResponses.warningMentions(message)).catch(err => {
            console.log(err);
            logChan.send(ListenerResponses.cannotMessageUser(message.author)).catch(err => console.log(err));
        });
        logChan.send(ListenerResponses.tooManyMentions(message.author, message));

    }
    // No invite messages
    if (config.noInvites && message.content.toLowerCase().includes("https://discord.gg/")) {
        try {
            await message.delete();
        } catch (err) {
            console.log(err);
            return logChan.send(ListenerResponses.cannotDeleteMessage(message));
        }
        message.author.send(ListenerResponses.warningInvite(message)).catch(err => {
            console.log(err);
            logChan.send(ListenerResponses.cannotMessageUser(message.author));
        });
        return logChan.send(ListenerResponses.inviteDeleted(message.author, message));

    }

    const member = guild.member(message.author);
    if (!member)
        return;
    if (member.roles.highest.position < guild.roles.resolve(config.modID).position)
        await filterMessage(message);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (!client.commands.has(command)) return; // No command found; do nothing
    if (!message.content.startsWith(config.prefix)
        || message.author.bot
        || (message.guild && message.guild.id !== config.guildID)
        || (!message.guild && command !== 'report' && command !== "help")) return;
    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.log(error);
        message.channel.send(ListenerResponses.commandError(command, message).catch(err => console.log(err)));
    }

});

// New user joined
client.on('guildMemberAdd', async (member) => {
    const logChan = member.guild.channels.resolve(config.logChannel);
    const muted = await Mutes.findOne({
        where: {
            mutedID: member.id
        }
    }).catch(err => console.log(err));
    logChan.send(ListenerResponses.memberJoin(member));
    if (muted) {
        member.roles.add(config.muteID).then(() => {
            logChan.send(ListenerResponses.memberRemuted(member, muted));
        }).catch(err => console.log(err));

    }
});

// Someone left (or got kicked/banned)
client.on('guildMemberRemove', member => {
    // This gives the bot enough time to log a kick or ban in the database before we check
    setTimeout(checkRemoved, 2000, member);
});


client.on("messageUpdate", (oldMessage, newMessage) => {
    if (oldMessage.author.bot || newMessage.author.bot || oldMessage.content === newMessage.content || !oldMessage.guild || !newMessage.guild)
        return; // Creating an embed fires this event. This check prevents an error from crashing the bot and also prevents
    // logging messages with embeds.
    const logChan = oldMessage.client.guilds.resolve(config.guildID).channels.resolve(config.logChannel);
    if (!newMessage.member) return console.log("Strange behavior on message update. newMessage:\n" + newMessage, "oldMessage:\n" + oldMessage); // No idea what can cause this, but this should stop crashes.
    logChan.send(ListenerResponses.messageEdited(oldMessage, newMessage));
});

client.on("messageDelete", message => {
    const guild = message.client.guilds.resolve(config.guildID);
    const logChan = guild.channels.resolve(config.logChannel);
    if (message.content.toLowerCase().includes("https://discord.gg") || message.mentions.members?.size >= 7)
        return; // This is already handled by the message listener.
    if (!message.content && message.embeds) {
        return logChan.send(ListenerResponses.embedMessageDeleted(message));
    }
    logChan.send(ListenerResponses.messageDeleted(message));
});


function checkRemoved(member) {
    const logChan = member.guild.channels.resolve(config.logChannel);
    ModLogs.findAll({
        where: {
            loggedID: member.id,
            [Op.or]: [
                {logName: "ban"},
                {logName: "kick"}
            ],
            logTime: {
                [Op.gte]: Sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 MINUTE)")
            }
        }
    }).then(result => {
        if (!result.length) {
            logChan.send(ListenerResponses.memberLeave(member)).catch(err => console.log(err));
        }
    }).catch(err => {
        console.log(err);

    });
}

async function checkMutes(logChan) {
    const mutes = await Mutes.findAll({
        attributes: {
            include: [
                [Sequelize.fn('TIME_TO_SEC', Sequelize.literal("NOW()")), 'nowSeconds'],
                [Sequelize.fn('TIME_TO_SEC', Sequelize.col("unmutedTime")), 'unmuteSeconds']
            ]
        }
    });
    console.log(mutes);
    if (!mutes.length) return false; // If no mutes are found, mutes will be an empty array
    else return queueUnmutes(mutes, logChan);
}

async function queueUnmutes(mutes, logChan) {
    const guild = await client.guilds.fetch(config.guildID);
    let fields = [];
    mutes.forEach(mute => {
        const duration = (parseInt(mute.getDataValue("unmuteSeconds"), 10) - parseInt(mute.getDataValue("nowSeconds"), 10)) * 1000;
        setTimeout(unmute, duration, mute, guild, logChan);
        fields.push({
            name: mute.getDataValue("mutedName"),
            value: "Muted for " + mute.getDataValue("duration") + " at " + mute.getDataValue("mutedTime") + ".\n"
                + "Unmute scheduled at " + mute.getDataValue("unmutedTime") + ".",
            inline: true
        });

    });
    logChan.send(ListenerResponses.unmutesSchedule(fields)).catch(err => console.log(err));
}

async function unmute(mute, guild, logChan) {
    const checkMute = await Mutes.findOne({
        where: {
            mutedID: mute.getDataValue("mutedID")
        }
    });
    if (!checkMute.length)
        return; // Probably unmuted manually; ignore.
    const user = await guild.client.users.fetch(mute.getDataValue("mutedID"));
    const member = await guild.members.fetch(user);
    if (member)
        await member.roles.remove(config.muteID, user.username + "'s mute has expired.");
    await Mutes.destroy({
        where: {
            mutedID: user.id
        }
    }).catch(err => console.log(err));
    logChan.send(ListenerResponses.muteExpireLog(member, mute.getDataValue("duration")));
    user.send(ListenerResponses.muteExpireUser(guild)).catch(err => {
        console.log(err);
        logChan.send(ListenerResponses.cannotMessageUser(user)).catch(err => console.log(err));
    });

}

async function filterMessage(message) {
    const filters = await Blacklist.findAll();
    if (!filters) return false; // No filters in place
    filters.forEach(filter => {
        let text = message.content;
        let flags = filter.getDataValue("flags");
        if (flags)
            flags = flags.split(","); // ["a", "s", "d", ...]
        let options = filter.getDataValue("options");
        if (options)
            options = options.split(",");// ["minimumaccountage:3d", "warntime:5d", ...]
        let term = filter.getDataValue("term");
        if (flags.indexOf("n") !== -1) {
            // Remove the flag from the list so we can iterate over actions later
            flags.splice(flags.indexOf("n"), 1);
            const accountAge = message.author.createdAt;
            const serverTime = message.member.joinedAt;
            let minimumAccountAge = options.filter(option => option.startsWith("minimumaccountage"));
            if (minimumAccountAge.length) {
                const time = minimumAccountAge[0].split(":");
                const duration = getDuration(time[1])[0];
                if (Date.now() - accountAge < Date.now() - duration)
                    return false; // Account is older than set age; Ignore this filter
            }
            let minimumServerTime = options.filter(option => option.startsWith("minimumservertime"));
            if (minimumServerTime.length) {
                const time = minimumServerTime[0].split(":");
                const duration = getDuration(time[1])[0];
                if (Date.now() - serverTime < Date.now() - duration)
                    return false; // Account has been in server long enough; Ignore filter
            }
        }
        if (flags.indexOf("i") !== -1) { // Case insensitive; transform term and text to lower
            flags.splice(flags.indexOf("i"), 1);
            term = term.toLowerCase();
            text = text.toLowerCase();
        }
        if (text.includes(term)) {
            const logChan = client.guilds.resolve(config.guildID).channels.resolve(config.logChannel);
            let actions = [];
            const filterID = filter.getDataValue("id");
            flags.forEach(async flag => {
                switch (flag) {
                    case "b":
                        message.guild.members.ban(message.author, {reason: "Banned automatically due to filter settings"}).then(() => {
                            actions.push("User was banned.")
                        }).catch(err => {
                            console.log(err);
                            actions.push("Attempted to ban but did not succeed.")
                        });
                        break;
                    case "k":
                        message.guild.members.kick(message.author, "Kicked automatically due to filter settings").then(() => {
                            actions.push("User was kicked.");
                        }).catch(err => {
                            console.log(err);
                            actions.push("Attempted to kick but did not succeed.");
                        });
                        break;
                    case "w":
                        flags.splice(flags.indexOf("w"), 1); // Remove from the list so softban knows what to do
                        await ModLogs.create({
                            loggedID: message.author.id,
                            loggerID: client.user.id,
                            logName: "filter" + filterID,
                            message: "Warning logged automatically via filter #" + filterID
                        }).then(() => {
                            actions.push("Warning logged for user.");
                        }).catch(err => {
                            console.log(err);
                            actions.push("Attempted to log warning but did not succeed.")
                        });
                        break;
                    case "s":
                        let time = options.filter(option => option.startsWith("warntime"))[0].split(":")[1];
                        let interval = getDuration(time)[1];
                        const warnings = await ModLogs.count({
                            where: {
                                loggerID: client.user.id,
                                logTime: {[Op.gte]: Sequelize.literal("DATE_SUB(NOW(), " + interval + ")")},
                                logName: "filter" + filterID
                            }
                        });
                        let threshold = 0;
                        if (flags.indexOf("w") !== -1)
                            threshold += 1;
                        threshold += parseInt(options.filter(option => option.startsWith("warnlimit"))[0].split(":")[1], 10);
                        if (warnings === threshold) {
                            await message.guild.members.ban(message.author, {
                                reason: "Banned automatically" +
                                    " due to an accumulation of automated warnings."
                            }).then(() => {
                                actions.push("User banned for accumulation of automated warnings.");
                            }).catch(err => {
                                console.log(err);
                                actions.push("User reached threshold for automated ban, but the ban did not succeed.")
                            });
                        }
                        break;
                    case "d":
                        message.delete().then(() => {
                            actions.push("Message was deleted.");
                        }).catch(err => {
                            console.log(err);
                            actions.push("Attempted to delete message but did not succeed.");
                        });
                        break;
                }
            })

                logChan.send(ListenerResponses.filterActions(filterID, message, actions));
        }



    })
}

function getDuration(arg) {
    const measure = arg.trim().toLowerCase().slice(-1);
    const time = parseInt(arg.trim().toLowerCase().slice(0, 1), 10);
    let duration = 1;
    let interval = "INTERVAL " + time.toString();
    switch (measure) {
        case ("d"):
            interval += " DAY";
            duration = time * 24 * 60 * 60; // d*h*m*s
            break;
        case ("h"):
            interval += " HOUR";
            duration = time * 60 * 60;  // h*m*s
            break;
        case ("m"):
            interval += " MINUTE";
            duration = time * 60; // m*s
            break;
        case ("s"): // Do nothing
            interval += " SECOND";
            duration = time;
            break;
        default:
            return false; // Don't recognize the format
    }
    return [duration * 1000, interval];
}

client.login(config.token);