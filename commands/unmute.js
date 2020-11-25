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
const UnmuteResponses = require("../responses/unmuteResponses.js");

module.exports = {
    name: 'unmute',
    description: 'Unmute a user.',
    usage: config.prefix + 'unmute (userID) (reason)',
    notes: 'The (reason) parameter is not optional.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(UnmuteResponses.unauthorizedUser(message, "unmute " + args[0 + "."]));
        const userID = args.shift();
        const user = await message.client.users.fetch(userID);
        if (!user)
            return message.channel.send(UnmuteResponses.userNotFound(message, userID));
        const reason = args.join(" "); // The earlier shift() removed the user ID; only the reason should be left.
        if (!reason) {
            return message.channel.send(UnmuteResponses.syntaxError("No reason specified."));
        }
        const muted = await Mutes.findOne({where: {mutedID: userID}}).catch(err => console.log(err));
        if (!muted)
            return message.channel.send(UnmuteResponses.userNotMuted(user));
        await sequelize.transaction(() => {
            return Mutes.destroy({
                where: {
                    mutedID: user.id
                }
            }).catch(err => {
                console.log(err);
                logChan.send(UnmuteResponses.unmuteDatabaseFailure(user));
                throw err; // If this fails, we need to hit the brakes.
            });
        });
        await sequelize.transaction(() => {
            return ModLogs.create({
                loggedID: user.id,
                loggerID: message.author.id,
                logName: "unmute",
                message: reason
            })
        }).catch(err => {
            console.log(err);
            return logChan.send(UnmuteResponses.unmuteLogFailure(user));
        });
        const member = await message.guild.members.fetch(user).catch(err => console.log(err));
        if (!member) {
            logChan.send(UnmuteResponses.userNotInServer(user.id, user.tag))
            return user.send(UnmuteResponses.notifyUser(message, reason)).catch(err => {
                console.log(err);
                return logChan.send(UnmuteResponses.cannotMessageUser(user));
            });
        }
        await member.roles.remove(config.muteID, reason).catch(err => {
            console.log(err);
            return message.channel.send(UnmuteResponses.unmuteFailure(member));
        });
        await message.channel.send(UnmuteResponses.unmuteSuccess(member));
    }
}
