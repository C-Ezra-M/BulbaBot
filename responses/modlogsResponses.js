/*
 * Responses for the modlogs command
 */

const config = require('../config.json');
const Discord = require("discord.js");

const ModlogsResponses = {
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

    apiError(details, fields = []){
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("API Error")
            .setDescription(details)
            .setTimestamp();
        if (fields.length)
            return response.addFields(fields);
        else return response;
    },

    showLogs(userName, fields){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memLogs)
            .setTitle("Warnings for " + userName)
            .addFields(fields)
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

    databaseReadError: new Discord.MessageEmbed()
        .setColor(config.messageColors.error)
        .setTitle("Database Error")
        .setDescription("An error occurred while attempting to access the database. This may indicate a bug, "
            + "or the database may be down. Please inform the bot's administrator.")
        .setTimestamp(),
}

module.exports = ModlogsResponses;