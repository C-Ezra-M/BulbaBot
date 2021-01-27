/* 
 * Mute a user.
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const Mutes = require('../includes/sqlMutes.js');
const MuteResponses = require('../responses/muteResponses.js');

module.exports = {
    name: 'mute',
    description: 'Mute a user.',
    usage: config.prefix + 'mute (duration) (userID) (reason)',
    notes: 'Duration accepts days (d), hours (h), minutes (m), or seconds (s).\n'
        + 'Example: ' + config.prefix + 'mute 24h 10765432100123456789 Spam',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(MuteResponses.unauthorizedUser(message, "mute " + args[0] + "."));
        const userDuration = args.shift(); // This is needed for human readable output later
        let duration = this.getDuration(userDuration);
        if (!duration)
            return message.channel.send(MuteResponses.syntaxError("Your format for the duration is not correct. You can specify days (d), hours (h), minutes(m), or seconds (s).", message));
        const interval = duration[1];
        duration = duration[0];
        const userID = args.shift().trim();
        const reason = args.join(" "); // The earlier shift()s removed the user ID and duration; only the reason should be left.
        if (!reason)
            return message.channel.send(MuteResponses.syntaxError("Please specify a reason for the mute."));

        const user = await message.client.users.fetch(userID).catch(err => {
            console.log(err);
            return message.channel.send(MuteResponses.apiError("Error encountered while attempting to retrieve user."
                + " This may indicate a bug, or the Discord API may be unavailable."));
        });
        if (!user)
            return message.channel.send(MuteResponses.userNotFound(message, userID));

        const muted = await Mutes.findOne({where: {mutedID: user.id}});
        if (muted)
            return message.channel.send(MuteResponses.alreadyMuted(user, muted));

        const member = await message.guild.members.fetch(user).catch(err => console.log(err));
        if (!member)
            message.channel.send(MuteResponses.memberNotFound(user, message));
        else if (member.roles.highest.position >= modGroup.position)
            return logChan.send(MuteResponses.privilegedUser(message.author, user));
        if (member)
            await member.roles.add(config.muteID, reason).catch(err => {
                console.log(err);
                return message.channel.send(MuteResponses.muteFailed(user));
            });
        setTimeout(this.unmute, duration, user, duration, userDuration, message, logChan);
        return sequelize.transaction(() => {
            return ModLogs.create({
                loggedID: user.id,
                loggerID: message.author.id,
                logName: "mute:" + userDuration,
                message: reason
            })
                .then(() => {
                    return Mutes.create({
                        mutedID: user.id,
                        mutedName: user.tag,
                        duration: userDuration,
                        unmutedTime: Sequelize.literal("DATE_ADD(NOW()," + interval + ")")
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
        })
            .then(() => {
                console.log("Transaction success.");
                // Transaction was successfully committed. Everything is A-OK.
                message.channel.send(MuteResponses.muteSuccess(user, userDuration));
                user.send(MuteResponses.notifyUser(reason, userDuration, message));
            })
            .catch(err => {
                console.log(err);
                message.channel.send(MuteResponses.databaseWriteFailure(user));
                user.send(MuteResponses.notifyUser(reason, userDuration, message)).catch(err => {
                    console.log(err);
                    logChan.send(MuteResponses.cannotMessageUser(user));
                });
            });
        },
    /**
     * Process user input to create proper time measurements
     * @param arg
     * @returns {boolean|(number|string)[]}
     */
    getDuration(arg) {
        const measure = arg.trim().toLowerCase().slice(-1);
        const time = parseInt(arg, 10);
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
    },

    async unmute(user, duration, userDuration, message, logChan) {
        const mute = await Mutes.findOne({
            where: {
                mutedID: user.user.id
            }
        });
        if (!mute)
            return; // Probably unmuted manually; ignore.
        const name = mute.getDataValue("mutedName");
        await sequelize.transaction(() => {
            return Mutes.destroy({
                where: {
                    mutedID: user.id
                }
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
        const member = await message.guild.members.fetch(user).catch(err => console.log(err));
        if (!member) {
            logChan.send(MuteResponses.userNotInServer(user.id, name));
            return user.send(MuteResponses.muteExpireUser(message.guild)).catch(err => {
                console.log(err);
                return logChan.send(MuteResponses.cannotMessageUser(user));
            });
        }
        if (member)
            await member.roles.remove(config.muteID, user.username + "'s mute has expired.");
        logChan.send(MuteResponses.muteExpireLog(member, userDuration));
        user.send(MuteResponses.muteExpireUser(message.guild)).catch(err => {
            console.log(err);
            logChan.send(MuteResponses.cannotMessageUser(user));
        });

    }
};