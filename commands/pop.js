/* 
 * Unarchive a channel
 */

const config = require('../config.json');
const PopResponses = require("../responses/popResponses.js");

module.exports = {
    name: 'pop',
    description: 'Pops (unarchives) a channel.',
    usage: config.prefix + 'pop (channelID) (categoryID)',
    notes: '',
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(PopResponses.unauthorizedUser(message, "unarchive " + args[0] + "."));
        // Get the channel.
        const channel = message.guild.channels.resolve(args[0]);
        if (!channel)
            return message.channel.send(PopResponses.syntaxError(args[0] + " is not a valid channel ID.", message));
        const cat = message.guild.channels.resolve(args[1]);
        if (cat?.type !== 'category')
            return message.channel.send(PopResponses.syntaxError(args[1] + " is not a valid category ID", message));
        const catName = cat.toString();
        return channel.edit({parentID: cat.id}).then(() =>{
            message.channel.send(PopResponses.popSuccess(channel, catName));
            logChan.send(PopResponses.popSuccessLog(channel, catName, message.author));
        }).catch(err => {
            console.log(err);
            logChan.send(PopResponses.popFailure(channel, catName));
        });
    }
};
