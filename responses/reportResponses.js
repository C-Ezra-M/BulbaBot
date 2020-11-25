/*
 * Responses for the report command
 */

const config = require('../config.json');
const Discord = require("discord.js");

const PopResponses = {
    syntaxError(error, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Syntax Error")
            .setDescription(error)
            .addField("Command:", message.content)
            .setTimestamp();
    },

    newReport(member, avatar, tag, reason){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.report)
            .setTitle('New Report')
            .setThumbnail(avatar)
            .setDescription("Report made against user:\n"
                + "<@!" + member.id + "> (" + tag + ")")
            .addField("Reason: ", reason)
            .setFooter("ID: " + member.id)
            .setTimestamp();
    },

    logFailure(member, reason){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle('Warning!')
            .setDescription("Failed to log a report!\n"
                + "A user tried to report "
                + "<@!" + member.id + "> (" + member.tag + ") for reason \"" + reason + "\"\n"
                + "The database may be inaccessible. Please notify the bot's administrator.")
            .setTimestamp();
    },

    memberNotFound(message, tag) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User Not Found")
            .setDescription('No user found with tag ' + tag + ". The user must be a member of the server."
            + " If you need to report someone who has left the server, you will need to contact the moderators.")
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

    notifyUser(tag){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.report)
            .setTitle("Report Received")
            .setDescription("Your report against " + tag + " has been received. It will be reviewed by the"
            + " moderators. If the user is messaging you privately, you can block them to prevent them from contacting"
            + " you again. If you believe this is an emergency, you are encouraged to contact the moderators personally.")
            .setTimestamp();
    }
}

module.exports = PopResponses;