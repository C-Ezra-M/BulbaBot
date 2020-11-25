/* 
 * Produce a list of help commands.
 * Alternatively, list the help information for a single command.
 */
const config = require('../config.json');
const HelpResponses = require("../responses/helpResponses.js");
module.exports = {
    name: 'help',
    description: 'Provide a list of commands, or provide information on a specific command.',
    usage: config.prefix + 'help (command)',
    notes: 'Running ?help with no additional input will produce a list of commands.',
    execute(message, args) {
        const commands = message.client.commands;
        const data = [];
        if (args.length && commands.has(args[0])) {
            return message.channel.send(HelpResponses.commandHelp(commands.get(args[0])));
        } else if (args.length && !message.client.commands.has(args[0])) {
            return message.channel.send(HelpResponses.commandNotFound(args[0], message));
        } else {
            data.push('This is a list of all current commands:');
            data.push("`" + message.client.commands.map(command => command.name).join('`, `') + "`");
            data.push("You can send " + config.prefix + "help (command name)\ to get info on a specific command.");
            const description = data.join("\n");
            return message.channel.send(HelpResponses.commandList(description));
        }

    }
}