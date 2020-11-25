/*
 * Log a warning to the database.
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const LogResponses = require("../responses/logResponses.js");
module.exports = {
    name: 'log',
    description: 'Log a warning to the database.',
    usage: config.prefix + 'log (userID) (reason)',
    notes: 'All fields are mandatory.',
    async execute(message, args) {
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && !message.member.roles.cache.find(role => role.id === config.modID)) {
            return logChan.send(LogResponses.unauthorizedUser(message, "warn " + args[0] + "."));
        }
        const userID = args.shift();
        const reason = args.join(" ");
        const user = await message.client.users.fetch(userID).catch(err => {
            console.log(err);
            return message.channel.send(LogResponses.apiError("Error attempting to retrieve user.\n"
                + "This may indicate a bug, or Discord's API may not be responding."));
        });
        if (!user) {
            return message.channel.send(LogResponses.userNotFound(message, userID));
        }
        const results = await sequelize.transaction(() => {
            return ModLogs.create({
                loggedID: user.id,
                loggerID: message.author.id,
                logName: "warning",
                message: reason
            })
        }).catch(err => {
            console.log(err);
            return message.channel.send(LogResponses.warningFailed(user));
        })
        return message.channel.send(LogResponses.warningSuccess(user, reason, results, message));

    }
}