/*
 * Deletes a warning for a user.
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ModLogs = require('../includes/sqlModLogs.js');
const ClearwarnResponses = require('../responses/clearwarnResponses.js');
module.exports = {
    name: 'clearwarn',
    description: 'Deletes a single warning.',
    usage: config.prefix + 'clearwarn (warningID)',
    notes: 'Be sure to use the ID of the warning as provided by modlogs.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(ClearwarnResponses.unauthorizedUser(message, "remove warning ID " + args[0]));
        const warnID = args[0];
        const warning = await ModLogs.findOne({
            where: {
                id: warnID
            }
        }).catch(err => {
            console.log(err);
            message.channel.send(ClearwarnResponses.databaseReadError);
        });
        if (!warning) {
            return message.channel.send(ClearwarnResponses.invalidWarnID(warning, message));
        }
        const user = await message.client.users.fetch(warning.getDataValue("loggedID")).catch(err => {
            console.log(err);
            return message.channel.send(ClearwarnResponses.apiError("Unable to fetch users. This may indicate a bug,"
                + " or Discord's API may be down.")).catch(err => console.log(err));
        });
        message.channel.send(ClearwarnResponses.requestConfirm(warning, user.tag)).then(mess => {
            mess.react("❌");
            mess.react("✅");
            mess.awaitReactions((reaction, user) => user.id === message.author.id && (reaction.emoji.name === "❌" || reaction.emoji.name === "✅"), {
                max: 1,
                time: 30000
            })
                .then(async reaction => {
                    if (reaction.first().emoji.name === "✅") {
                        const warnID = warning.getDataValue("id");
                        await warning.destroy().then(() => {
                                return message.channel.send(ClearwarnResponses.deleteSuccess(warnID)).catch(err => console.log(err));
                            }
                        )
                            .catch(err => {
                                console.log(err);
                                message.channel.send(ClearwarnResponses.deleteFailed(message)).catch(err => console.log(err));
                            })
                    }

                })
        })
    }
}
