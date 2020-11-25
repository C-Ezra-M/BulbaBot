/*
 * Outputs general server information
 */

const config = require('../config.json');
const ServerinfoResponses = require("../responses/serverinfoResponses.js");

module.exports = {
    name: 'serverinfo',
    description: 'Outputs information about the server.',
    usage: config.prefix + 'serverinfo',
    notes: 'No arguments needed; the information provided is static.',
    async execute(message) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(ServerinfoResponses.unauthorizedUser(message, "use the serverinfo command."));
        const members = message.guild.memberCount;
        const humans = message.guild.members.cache.filter(member => !member.user.bot).size;
        const bots = members - humans;
        let roles = [];
        message.guild.roles.cache.forEach(role => roles.push(role.name));
        roles = roles.join(", ").trim();
        let categories = [];
        message.guild.channels.cache.filter(channel => channel.type === "category").forEach(channel => categories.push(channel.name));
        categories = categories.join(", ").trim();
        return message.channel.send(ServerinfoResponses.showInfo(message, members, humans, bots, roles, categories));
    }
}