/* 
 * Unban a user
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const UnbanResponses = require("../responses/unbanResponses.js");

module.exports = {
    name: 'unban',
    description: 'Unban a user from the server.',
    usage: config.prefix + 'unban (user ID) (reason)',
    notes: 'The reason is mandatory.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(UnbanResponses.unauthorizedUser(message, "unban " + args[0] + "."));
        const userID = args.shift();
        const reason = args.join(" ");
        if (!reason){
            return message.channel.send(UnbanResponses.syntaxError("No reason provided.", message));
        }
        const user = await message.client.users.fetch(userID).catch(err => {
            console.log(err);
        })
        if (!user)
            return message.channel.send(UnbanResponses.userNotFound(message, userID));
        const bans = await message.guild.fetchBans().catch(err => {
            console.log(err);
        });
        if (bans.size === 0)
            return message.channel.send(UnbanResponses.noActiveBans);
        const banned = bans.find(ban => ban.user.id === user.id);
        if (!banned)
            return message.channel.send(UnbanResponses.banNotFound(user));
        return message.guild.members.unban(user, reason).then(() => {
                sequelize.transaction(() => {
                    return ModLogs.create({
                        loggedID: user.id,
                        loggerID: message.author.id,
                        logName: "unban",
                        message: reason
                    }).catch(err => console.log(err));
                }).then(() => {
                    console.log("Transaction success.");
                    message.channel.send(UnbanResponses.unbanSuccess(user));
                    user.send(UnbanResponses.notifyUser(message, reason)).catch(err => {
                        console.log(err);
                        message.channel.send(UnbanResponses.cannotMessageUser(user));
                    });

                })
                    .catch(err => {
                        console.log(err);
                        message.channel.send(UnbanResponses.logWriteFailure);
                        user.send(UnbanResponses.notifyUser(message, reason)).catch(err => {
                            console.log(err);
                            message.channel.send(UnbanResponses.cannotMessageUser(user));

                        });
                    });
            }
        );
    }
}