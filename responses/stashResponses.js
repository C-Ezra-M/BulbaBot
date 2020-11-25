/*
 * Responses for the stash command
 */

const Discord = require("discord.js");
const config = require('../config.json');

const StashResponses = {
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

    stashSuccess(channel){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.chanStash)
            .setTitle("Channel Archived")
            .setDescription("Channel " + channel.toString() + " has been archived.")
            .setTimestamp();
    },

    stashFailure(channel){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription("Error archiving channel " + channel.toString() + ". Check the error log for more details.")
            .setTimestamp();
    },

    stashLog(channel, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.chanStash)
            .setTitle("Channel Archived")
            .setDescription("Channel " + channel.toString() + " has been archived by " + message.author.tag + ".")
            .setTimestamp();
    },

    channelNotFound(id){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Channel Not Found")
            .setDescription(id + " is not a valid channel ID.")
            .setTimestamp();
    }
}

module.exports = StashResponses;