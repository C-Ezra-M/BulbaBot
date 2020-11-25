/* 
 * Tell the bot to kick a user.
 */
const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const KickResponses = require("../responses/kickResponses.js");

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server.',
    usage: config.prefix + 'kick userID reason',
    notes: 'The "reason" parameter is not optional.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(KickResponses.unauthorizedUser(message, "kick " + args[0] + "."));
        const userID = args.shift();
        const reason = args.join(" "); // The earlier shift() removed the user ID; only the reason should be left.
        if (!reason) {
            return message.channel.send(KickResponses.syntaxError("No reason provided.", message));
        }
        const user = await message.client.users.fetch(userID).catch(err => console.log(err));
        if (!user)
            return message.channel.send(KickResponses.userNotFound(message, userID));
        const member = await message.guild.members.fetch(user).catch(err => console.log(err));
        if (!member)
            return message.channel.send(KickResponses.memberNotFound(user, message));
        if (member.roles.highest.position >= modGroup.position)
            return logChan.send(KickResponses.privilegedUser(message.author, user));
        return member.kick(reason).then(async () => {
            await message.channel.send(KickResponses.kickSuccess(user));
            await user.send(KickResponses.notifyUser(message, reason)).catch(err => {
                console.log(err);
                logChan.send(KickResponses.cannotMessageUser(user)).catch(err => console.log(err));
            });
            return sequelize.transaction(() => {
                return ModLogs.create({
                    loggedID: user.id,
                    loggerID: message.author.id,
                    logName: "kick",
                    message: reason
                }).catch(err => console.log(err));
            }).catch(err => {
                console.log(err);
                message.channel.send(KickResponses.logWriteFailure(member, user.tag));
                user.send(KickResponses.notifyUser(message, reason)).catch(err => {
                    console.log(err);
                    logChan.send(KickResponses.cannotMessageUser(user)).catch(err => console.log(err));
                });
            });
        }).catch(err => {
            console.log(err);
            return message.channel.send(KickResponses.kickFailed(member)).catch(err => console.log(err));
        });
    }
}