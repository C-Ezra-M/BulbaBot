/* 
 * Ban a user from the server
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const BanResponses = require("../responses/banResponses.js");
module.exports = {
    name: 'ban',
    description: 'Ban a user from the server.',
    usage: config.prefix + 'ban (userID) (reason)',
    notes: 'Reason is mandatory.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(BanResponses.unauthorizedUser(message, "ban " + args[0] + "."));
        const userID = args.shift();
        const user = await message.client.users.fetch(userID).catch(err => console.log(err))
        if (!user)
            return message.channel.send(BanResponses.userNotFound(message, userID)).catch(err => console.log(err));
        const reason = args.join(" ");
        if (!reason)
            return message.channel.send(BanResponses.syntaxError("No reason provided.", message));
        const member = await message.guild.members.fetch(user).catch(err => console.log(err));
        if (!member)
            message.channel.send(BanResponses.memberNotFound(user, message));
        else if (member.roles.highest.position >= modGroup.position)
            return logChan.send(BanResponses.privilegedUser(message.author, user));
        return message.guild.members.ban(user, {'reason': reason}).then(() => {
            message.channel.send(BanResponses.banSuccess(user));
            logChan.send(BanResponses.banSuccessLog(user, reason, message));
            user.send(BanResponses.notifyUser(reason, message)).catch(err => {
                console.log(err);
                logChan.send(BanResponses.cannotMessageUser(user))
            });
            sequelize.transaction(() => {
                return ModLogs.create({
                    loggedID: user.id,
                    loggerID: message.author.id,
                    logName: "ban",
                    message: reason
                }).catch(err => console.log(err));
            }).catch(err => {
                console.log(err)
                message.channel.send(BanResponses.logWriteFailure).catch(err => console.log(err));
            });
        }).catch(err => {
            console.log(err);
            return message.channel.send(BanResponses.banFailed(user));
        });

    }
};