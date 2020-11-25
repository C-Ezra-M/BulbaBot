/*
 * Responses for the help command
 */

const Discord = require("discord.js");
const config = require("../config.json");

const HelpResponses = {
    commandHelp(command) {
       return new Discord.MessageEmbed()
            .setColor(config.messageColors.commandHelp)
            .setTitle("Help: " + command.name)
            .setDescription('Command: ' + config.prefix + command.name + '\n' +
                'Description: ' + command.description + '\n' +
                'Usage: ' + command.usage + '\n' +
                'Notes: ' + command.notes);
    },

    commandList(description){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.commandHelp)
            .setTitle("Help")
            .setDescription(description);
    },

    commandNotFound(command, message) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Error")
            .setDescription('Command "' + command + '" not found. Check your spelling.')
            .addField("Command:", message.content)
            .setTimestamp();
    }
}

module.exports = HelpResponses;