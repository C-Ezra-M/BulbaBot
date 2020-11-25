/*
 * Responses for the pop command
 */

const config = require('../config.json');
const Discord = require("discord.js");

const PopResponses = {
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

    syntaxError(error, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Syntax Error")
            .setDescription(error)
            .addField("Command:", message.content)
            .setTimestamp();
    },

    popSuccessLog(channel, catName, user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.chanPop)
            .setTitle("Channel Unarchived")
            .setDescription("Channel " + channel.toString() + ' has been unarchived to category "' + catName + '" ' +
                'by user ' + user.tag + '.')
            .setTimestamp();
    },

    popSuccess(channel, catName){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.chanPop)
            .setTitle("Channel Unarchived")
            .setDescription("Channel " + channel.toString() + ' has been unarchived to category "' + catName + '."')
            .setTimestamp();
    },

    popFailure(channel, catName){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription("Unarchiving channel " + channel.toString() + " to category " + catName + " failed."
                + "This may indicate a bug, or Discord's API may be unreachable.")
            .setTimestamp();
    }
}

module.exports = PopResponses;