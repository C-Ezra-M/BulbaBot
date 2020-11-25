/*
 * Ignore a channel
 */

const config = require('../config.json');
const IgnoreResponses = require("../responses/ignoreResponses.js");

module.exports = {
    name: 'ignore',
    description: 'Ignore a channel.',
    usage: config.prefix + 'ignore (group)',
    notes: "Don't #mention a channel, just use the provided group name.",
    execute(message, args) {
        if (!config.ignores || !Object.keys(config.ignores).length)
            return; // Not set; do nothing.
        const group = args[0];
        if (!group) {
            return message.channel.send(IgnoreResponses.syntaxError("You must specify the ignore group.", message));
        }
        if (!config.ignores[group]) {
            return message.channel.send(IgnoreResponses.syntaxError(group + " is not linked to valid ignore role.", message));
        }
        const member = message.guild.member(message.author);
        if (!member.roles.cache.get(config.ignores[group])){
            addIgnore(member, group, message);
        }
        else removeIgnore(member, group, message);
    }
}

function addIgnore(member, group, message){
    member.roles.add(config.ignores[group]).then(() => {
        return message.channel.send(IgnoreResponses.ignoreSuccess(group));
    }).catch(err => {
        console.log(err);
    });
}

function removeIgnore(member, group, message){
    member.roles.remove(config.ignores[group]).then(() => {
        return message.channel.send(IgnoreResponses.unignoreSuccess(group));
    }).catch(err => {
        console.log(err);
    });
}