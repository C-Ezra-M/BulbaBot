/*
 * Responses for the ignore command
 */

const Discord = require("discord.js");
const config = require("../config.json");

const IgnoreResponses = {
    syntaxError(error, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription(error)
            .addField("Command:", message.content)
            .setTimestamp();
    },

    ignoreSuccess(group){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.ignore)
            .setTitle('"' + group + '" Ignored')
            .setDescription("You will no longer receive notifications from the channels specified by the " + group + " ignore group.\n"
                + "If this was an accident, you can repeat the command to remove the ignore.")
            .setTimestamp();
    },

    unignoreSuccess(group){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.ignore)
            .setTitle('"' + group + '" No Longer Ignored')
            .setDescription("You are no longer ignoring the " + group + " group. You will now receive notifications from the channels specified.")
            .setTimestamp();
    }



}

module.exports = IgnoreResponses;