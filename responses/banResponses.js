/*
 * Responses for the ban command
 */

const Discord = require("discord.js");
const config = require('../config.json');
const BanResponses = {
    unauthorizedUser(message, command) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setAuthor("Unauthorized User", message.author.displayAvatarURL())
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription("Unprivileged user " + message.author.tag + " attempted to " + command)
            .addField("Message", message.content)
            .setFooter("ID: " + message.author.id)
            .setTimestamp();
    },

    memberNotFound(user, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Warning: User is Not in Server")
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

    banFailed(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Ban Failed")
            .setDescription("I was unable to ban user ID " + user.id + " (" + user.tag + "). Are my permissions set incorrectly?")
            .setTimestamp();
    },

    notifyUser(reason, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memBan)
            .setTitle("You Have Been Banned")
            .setDescription("You have been banned from " + message.guild.name + ".")
            .addField("Moderator message:", reason)
            .setTimestamp();
    },

    cannotMessageUser(user){
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

    banSuccessLog(user, reason, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memBan)
            .setAuthor("User Banned", user.displayAvatarURL())
            .setThumbnail(user.displayAvatarURL())
            .setDescription(user.tag + " has been banned from this server by " + message.author.tag + ".")
            .addField("Reason:", reason)
            .setTimestamp();
    },

    banSuccess(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memBan)
            .setTitle("User Banned")
            .setDescription(user.tag + " banned successfully.")
            .setTimestamp();
    },

    privilegedUser(user, recipient){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setTitle("Misuse Detected From " + user.tag)
            .setDescription("The bot cannot be used to perform moderation actions on other moderators or higher.")
            .addField("User " + user.tag, "Attempted to ban " + recipient.tag)
            .setTimestamp()
    }
}

module.exports = BanResponses;