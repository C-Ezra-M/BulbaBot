/*
 * Gather all information about a user.
 */

const config = require('../config.json');
const WhoisResponses = require("../responses/whoisResponses.js");

module.exports = {
    name: 'whois',
    description: 'Gets information about a user.',
    usage: config.prefix + 'whois (userID)',
    notes: 'Due to the sensitive nature of the information provided, this command is restricted to moderators.',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(WhoisResponses.unauthorizedUser(message, "whois " + args[0]));
        const userID = args.shift();
        const user = await message.client.users.fetch(userID);
        if (!user)
            return message.channel.send(WhoisResponses.userNotFound(message, userID))
        const member = await message.guild.members.fetch(user);
        let status = [];
        let game = [];
        const customStatus = user.presence.activities.find(act => act.type === "CUSTOM_STATUS");
        const playing = user.presence.activities.find(act => act.type === "PLAYING");
        if (customStatus && playing) {
            status.push(customStatus.state);
            game.push(playing.name);
        }
        else if (playing && !customStatus) {
            status.push("Playing");
            game.push(playing.name);
        }
        else if (customStatus && !playing){
            status.push(customStatus.state);
        }
        else status.push(user.presence.status);
        if (!status.length)
            status.push("N/A");
        if (!game?.length)
            game.push("None");
        return message.channel.send(WhoisResponses.showInfo(user, member, status, game));
    }
};