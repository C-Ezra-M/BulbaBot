/* 
 * Retrieve all logs for a user.
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const ModlogsResponses = require("../responses/modlogsResponses.js");
module.exports = {
    name: 'modlogs',
    description: 'Retrieves all moderation logs for a member.',
    usage: config.prefix + 'modlogs (userID)',
    notes: '',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(ModlogsResponses.unauthorizedUser(message, "view warnings for " + args[0] + "."));
        const user = await message.client.users.fetch(args[0]).catch(err => {
            console.log(err);
            return message.channel.send(ModlogsResponses.apiError("Error encountered while attempting to retrieve user."
                + " This may indicate a bug, or the Discord API may be unavailable."));
        });
        if (!user)
            return message.channel.send(ModlogsResponses.userNotFound(args[0]));

        const warnings = await ModLogs.findAll({
            where: {
                loggedID: user.id
            }
        }).catch(err => {
            console.log(err);
            logChan.send(ModlogsResponses.databaseReadError).catch(err => console.log(err));
        });
        let fields = [];
        for (let i = 0; warnings[i]; i++) {
            const warning = warnings[i];
            const id = warning.getDataValue("loggerID").toString();
            const mod = await message.client.users.fetch(id);
            let modName = "";
            if (!mod)
                modName = "(deleted or deactivated account)"
            else modName = mod.tag;
            const logType = warning.getDataValue("logName");
            let reason = "Reason: ";
            switch (logType) {
                case "ban":
                    reason += "**Member Banned**\nReason: ";
                    break;
                case "kick":
                    reason += "**Member Kicked**\nReason: ";
                    break;
                case "unban":
                    reason += "**Member Unbanned**\nReason: ";
                    break;
                case "unmute":
                    reason += "**Member Unmuted**\nReason: ";
                    break;
            }
            if (logType.includes("mute") && logType !== "unmute") {
                const duration = logType.split(":");
                reason += "**Member Muted** for " + duration[1] + "-\nReason: ";
            }
            fields.push({
                name: "Warning #" + (i + 1) + " - Warning ID: #" + warning.getDataValue("id"),
                value: "User:\n(" + user.id + ")\n" + user.tag + "\n" + reason + warning.getDataValue("message") + "\nModerator:\n(" + id + ')\n' + modName + '\nTime: ' + warning.getDataValue("logTime"),
                inline: true
            });
        }
        return message.channel.send(ModlogsResponses.showLogs(user.tag, fields));
    }
}