/*
 * Responses for the unban command
 */

const Discord = require("discord.js");
const config = require('../config.json');

const UnmuteResponses = {
    unmuteSuccess(member){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle('Member Unmuted')
            .setDescription("<@!" + member.id + "> (" + member.user.tag + ") unmuted successfully. This has been written to the log.")
            .setTimestamp();
    },

    unmuteFailure(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle('Error')
            .setDescription("Unmute of user " + user.tag + " failed. I may not have correct permissions, or there may be a problem with Discord.")
            .setTimestamp();
    },

    unmuteDatabaseFailure(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle('Error')
            .setDescription("I was unable to remove the mute for user " + user.tag + " from the database."
            + " The muted role was not removed. Please notify the bot's administrator of this error.")
            .setTimestamp();
    },

    notifyUser(message, reason){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnban)
            .setTitle("Mute Lifted")
            .setDescription("Your mute in " + message.guild.name + " has been lifted.")
            .addField("Moderator Message:", reason)
            .setTimestamp();
    },

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

    logWriteFailure: new Discord.MessageEmbed()
        .setColor(config.messageColors.error)
        .setTitle("Failed to Log")
        .setDescription("Your previous action was not logged due to an error. This may indicate a bug."
            + " If the action completed, you should manually log it later.")
        .setTimestamp(),

    cannotMessageUser(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Unable to Send Message")
            .setDescription("Attempt to send message to " + user.tag + " failed. This is likely a result of their privacy settings.")
            .setTimestamp();
    },

    userNotInServer(id, name){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle("Mute Lifted")
            .setDescription("Mute lifted for " + name + " (" + id + "), but they are not present in the server."
                + " If they rejoin, they will no longer be muted automatically.")
            .setTimestamp();
    },

    unmuteLogFailure(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription("Encountered an error while attempting to log unmute for " + user.tag + "."
            + " If the unmute was successful, you should manually log this later.")
    },

    userNotMuted(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Mute Not Found")
            .setDescription(user.tag + " does not have an active mute.")
            .setTimestamp();
    }
}

module.exports = UnmuteResponses;