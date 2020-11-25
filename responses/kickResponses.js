/*
 * Responses for the kick command
 */

const Discord = require("discord.js");
const config = require("../config.json");

const KickResponses = {
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

    syntaxError(error, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Syntax Error")
            .setDescription(error)
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

    memberNotFound(user, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User is Not in Server")
            .setDescription("User " + user.tag + " exists but is not a member of this server.")
            .addField("Command:", message.content)
            .setTimestamp();
    },

    kickFailed(member){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Kick Failed")
            .setDescription("I was unable to kick user ID " + member.id + " (" + member.user.tag + "). Are my permissions set incorrectly?")
            .setTimestamp();
    },

    kickSuccess(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memKick)
            .setTitle("Kick Successful")
            .setDescription("User " + user.tag + " has been kicked successfully, and the log has been updated.")
            .addField("ID:", user.id)
            .setTimestamp();
    },

    logWriteFailure(id, tag) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle('Database Error')
            .setDescription("Unable to log kick for <@!" + id + "> (" + tag + ").\n"
                + "There may be an issue with the database. You will need to manually log this later.")
            .setFooter("ID: " + id)
            .setTimestamp();
    },

    notifyUser(message, reason){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memKick)
            .setTitle("You Have Been Kicked")
            .setDescription("You have been kicked by a moderator in " + message.guild.name + ".\n" +
                "You may rejoin the server, but you are encouraged to review the rules to avoid further disciplinary action.")
            .addField("Moderator Message:", reason)
            .setTimestamp();
    },

    cannotMessageUser(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Unable to Send Message")
            .setDescription("Attempt to send message to " + user.tag + " failed. This is likely a result of their privacy settings.")
            .setTimestamp();
    },

    privilegedUser(user, recipient){
    return new Discord.MessageEmbed()
        .setColor(config.messageColors.misuseWarn)
        .setTitle("Misuse Detected From " + user.tag)
        .setDescription("The bot cannot be used to perform moderation actions on other moderators or higher.")
        .addField("User " + user.tag, "Attempted to kick " + recipient.tag)
        .setTimestamp()
    }
}


module.exports = KickResponses;