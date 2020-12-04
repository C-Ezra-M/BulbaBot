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
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (!client.commands.has(command)) return; // No command found; do nothing
    if (!message.content.startsWith(config.prefix)
        || message.author.bot
        || (message.guild && message.guild.id !== config.guildID)
        || (!message.guild && (command !== 'report'))) return;
    try {
        client.commands.get(command).execute(message, args);
    }
    catch (error) {
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
    if (oldMessage.author.bot || newMessage.author.bot || oldMessage.content === newMessage.content)
        return; // Creating an embed fires this event. This check prevents an error from crashing the bot and also prevents
    // logging messages with embeds.
    const logChan = oldMessage.guild.channels.resolve(config.logChannel);
    if (!newMessage.member) return console.log("Strange behavior on message update. newMessage:\n" + newMessage, "oldMessage:\n" + oldMessage); // No idea what can cause this, but this should stop crashes.
    logChan.send(ListenerResponses.messageEdited(oldMessage, newMessage));
});

client.on("messageDelete", message => {
    const logChan = message.guild.channels.resolve(config.logChannel);
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
                [Op.gte]: Sequelize.literal("DATE_SUB(NOW(), INTERVAL 5 MINUTE)")
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
    if (!mutes.length) return false;
    else return queueUnmutes(mutes, logChan);
}

async function queueUnmutes(mutes, logChan) {
    const guild = await client.guilds.fetch(config.guildID);
    let fields = [];
    mutes.forEach(mute => {
        const duration = (parseInt(mute.dataValues.unmuteSeconds, 10) - parseInt(mute.dataValues.nowSeconds, 10)) * 1000;
        setTimeout(unmute, duration, mute, guild, logChan);
        fields.push({
            name: mute.dataValues.mutedName,
            value: "Muted for " + mute.dataValues.duration + " at " + mute.dataValues.mutedTime + ".\n"
                + "Unmute scheduled at " + mute.dataValues.unmutedTime + ".",
            inline: true
        });

    });
    logChan.send(ListenerResponses.unmutesSchedule(fields)).catch(err => console.log(err));
}

async function unmute(mute, guild, logChan) {
    const checkMute = await Mutes.findOne({
        where: {
            mutedID: mute.dataValues.mutedID
        }
    });
    if (!checkMute.length)
        return; // Probably unmuted manually; ignore.
    const member = await guild.members.fetch(mute.dataValues.mutedID);
    await member.roles.remove(config.muteID, member.user.username + "'s mute has expired.");
    await sequelize.transaction(() => {
        return Mutes.destroy({
            where: {
                mutedID: member.id
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
    logChan.send(ListenerResponses.muteExpireLog(member, mute.dataValues.duration));
    member.user.send(ListenerResponses.muteExpireUser(guild)).catch(err => {
        console.log(err);
        logChan.send(ListenerResponses.cannotMessageUser(member.user)).catch(err => console.log(err));
    });

}

client.login(config.token);
