/* 
 * Archive a channel
 */

const config = require('../config.json');
const StashResponses = require("../responses/stashResponses.js");
module.exports = {
    name: 'stash',
    description: 'Stashes (archives) a channel.',
    usage: config.prefix + 'stash (channelID)',
    notes: '',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(StashResponses.unauthorizedUser(message, "archive " + args[0]));
        const channel = message.guild.channels.resolve(args[0]);
        if (!channel)
            return message.channel.send(StashResponses.channelNotFound(args[0]));
        channel.edit({parentID: config.archiveID}).then(() => {
            message.channel.send(StashResponses.stashSuccess(channel));
            logChan.send(StashResponses.stashLog(channel, message));
        }).catch(err => {
            console.log(err);
            message.channel.send(StashResponses.stashFailure(channel));
        });

    }
}