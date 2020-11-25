/*
 * Responses for the mute command
 */

const config = require('../config.json');
const Discord = require("discord.js");

const MuteResponses = {
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

    apiError(details, fields = []) {
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("API Error")
            .setDescription(details)
            .setTimestamp();
        if (fields.length)
            return response.addFields(fields);
        else return response;
    },

    alreadyMuted(user, mute) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User Already Muted")
            .setDescription("User " + user.id + " (" + user.tag + ") is already muted for " + mute.dataValues.duration + "."
                + "\nMute expires: " + mute.dataValues.unmutedTime)
            .setTimestamp();
    },

    muteSuccess(id, userName, duration) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memMute)
            .setTitle('Successfully Muted ' + userName)
            .setDescription("<@!" + id + "> (" + userName + ") muted successfully for " + duration + ".")
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

    notifyUser(reason, duration, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memMute)
            .setTitle("You Have Been Muted")
            .setDescription("You have been muted by a moderator in " + message.guild.name + " for " + duration + ".")
            .addField("Moderator Message:", reason)
            .setTimestamp();
    },

    databaseWriteFailure(member) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle('Warning!')
            .setDescription("<@!" + member.id + "> (" + member.user.tag + ") muted successfully, but writing to the log failed.\n\
There may be an issue with the database. You will need to manually " + config.prefix + "log this later.")
            .setFooter("ID: " + member.user.id)
            .setTimestamp();
    },

    cannotMessageUser(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Unable to Send Message")
            .setDescription("Attempt to send message to " + user.tag + " failed. This is likely a result of their privacy settings.")
            .setTimestamp();
    },

    muteFailed(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Mute Failed")
            .setDescription("I was unable to mute " + user.tag + ". Are my permissions set incorrectly?")
            .setTimestamp();
    },

    muteExpireLog(member, duration){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle("Mute Expired for " + member.user.tag)
            .setDescription("<@!" + member.id + "> (" + member.user.username + ") is now unmuted (" + duration + " mute).")
            .setTimestamp()
    },

    muteExpireUser(guild){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnban)
            .setTitle("Mute Expired")
            .setDescription("Your mute in " + guild.name + " has expired. Please review the rules to avoid future moderation action.")
            .setTimestamp();
    },

    userNotInServer(id, name){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle("Mute Expired")
            .setDescription("Mute expired for " + name + " (" + id + "), but they are not present in the server."
            + " If they rejoin, they will no longer be muted automatically.")
            .setTimestamp();
    },

    privilegedUser(user, recipient){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setTitle("Misuse Detected From " + user.tag)
            .setDescription("The bot cannot be used to perform moderation actions on other moderators or higher.")
            .addField("User " + user.tag, "Attempted to mute " + recipient.tag)
            .setTimestamp()
    }
}

module.exports = MuteResponses;