/*
 *
 */

const Discord = require('discord.js');
const config = require('../config.json');

const LogResponses = {
    unauthorizedUser(message, command){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setAuthor("Unauthorized User", message.author.displayAvatarURL())
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription("Unprivileged user " + message.author.tag + " attempted to " + command)
            .addField("Message", message.content)
            .setFooter("ID:", message.author.id)
            .setTimestamp();
    },

    userNotFound(message, id){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User Not Found")
            .setDescription('No user found with ID "' + id + '."')
            .addField("Command:", message.content)
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

    warningFailed(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription("Unable to log warning for user " + user.tag + ". This may indicate"
            + " a database error. Please inform the bot's administrator.")
            .setTimestamp();
    },

    warningSuccess(user, reason, results, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memWarn)
            .setTitle("Warning Logged for User " + user.tag)
            .setDescription("Warning ID #" + results.dataValues.id + "\nLogged by " + message.author.tag)
            .addFields([{name: "Warning:", value: reason},
                {name: "ID:", value: user.id, inline: true}])
            .setTimestamp();
    }
}

module.exports = LogResponses;