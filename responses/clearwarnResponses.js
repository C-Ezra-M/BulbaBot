/*
 * Responses for the clearwarn command.
 */
const Discord = require("discord.js");
const config = require("../config.json");

const ClearwarnResponses = {
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

    invalidWarnID(id, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Invalid Warning ID")
            .setDescription(id + " is not a valid warning ID.")
            .addField("Command:", message.content)
            .setTimestamp();
    },

    databaseReadError: new Discord.MessageEmbed()
        .setColor(config.messageColors.error)
        .setTitle("Database Error")
        .setDescription("An error occurred while attempting to access the database. This may indicate a bug, "
            + "or the database may be down. Please inform the bot's administrator.")
        .setTimestamp(),

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

    requestConfirm(warning, userName) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.confirm)
            .setTitle("Are you sure?")
            .setDescription("You are about to delete warning #" + warning.dataValues.id + " from user: (" + warning.dataValues.loggedID + ")\n" + userName + "\n\nMessage: " + warning.dataValues.message + "\n\nSelect a reaction to continue.")
    },

    deleteFailed(message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription("Something went wrong while attempting to delete the warning. Please inform the bot's administrator. The error logs will have more details.")
            .addField("Command:", message.content)
            .setTimestamp();
    },

    deleteSuccess(id) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.warnClear)
            .setTitle("Successfully Deleted")
            .setDescription("Warning #" + id + " has been successfully deleted.")
            .setTimestamp();
    }


}

module.exports = ClearwarnResponses;