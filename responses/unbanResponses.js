/*
 * Responses for the unban command
 */

const Discord = require("discord.js");
const config = require('../config.json');

const UnbanResponses = {
    unauthorizedUser(message, command) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setAuthor("Unauthorized User", message.author.displayAvatarURL())
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription("Unprivileged user " + message.author.tag + " attempted to " + command)
            .addField("Message", message.content)
            .setFooter("ID:", message.author.id)
            .setTimestamp();
    },

    memberNotFound(user, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User is Not in Server")
            .setDescription("User " + user.tag + " exists but is not a member of this server.")
            .addField("Command:", message.content)
            .setTimestamp();
    },

    userNotFound(message, id) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User Not Found")
            .setDescription('No user found with ID "' + id + '."')
            .addField("Command:", message.content)
            .setTimestamp();
    },

    syntaxError(error, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Syntax Error")
            .setDescription(error)
            .addField("Command:", message.content)
            .setTimestamp();
    },

    banNotFound(user) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Ban Not Found")
            .setDescription("User " + user.tag + " does not appear to be banned.")
            .setTimestamp();
    },

    unbanSuccess(user) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnban)
            .setTitle('Member Unbanned')
            .setDescription("<@!" + user.id + "> (" + user.tag + ") unbanned successfully.")
            .setFooter("ID: " + user.id)
            .setTimestamp();
    },

    notifyUser(message, reason) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnban)
            .setTitle("Ban lifted")
            .setDescription("Your ban in " + message.guild.name + " has been lifted.")
            .addField("Moderator Message:", reason)
            .setTimestamp()
    },

    cannotMessageUser(user) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Unable to Send Message")
            .setDescription("Attempt to send message to " + user.tag + " failed. This is likely a result of their privacy settings.")
            .setTimestamp();
    },

    logWriteFailure: new Discord.MessageEmbed()
        .setColor(config.messageColors.error)
        .setTitle("Failed to Log")
        .setDescription("Your previous action was not logged due to an error. This may indicate a bug."
            + " If the action completed, you should manually log it later.")
        .setTimestamp(),

    noActiveBans: new Discord.MessageEmbed()
        .setColor(config.messageColors.error)
        .setTitle("No Active Bans")
        .setDescription("Your server has no active bans.")
        .setTimestamp()

}

module.exports = UnbanResponses;