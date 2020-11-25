/*
 * Responses for the serverinfo command
 */

const Discord = require("discord.js");
const config = require('../config.json');

const ServerinfoResponses = {

    unauthorizedUser(message, command) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setTitle("Unauthorized User")
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription("Unprivileged user " + message.author.tag + " attempted to " + command)
            .addField("Message:", message.content)
            .setFooter("ID: " + message.author.id)
            .setTimestamp();
    },

    showInfo(message, members, humans, bots, roles, categories){
        return new Discord.MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL())
            .addFields([
                {name: "Owner", value: message.guild.owner.user.username, inline:true},
                {name: "Region", value: message.guild.region, inline:true},
                {name: "Text Channels", value: message.guild.channels.cache.filter(channel => channel.type === "text").size, inline:true},
                {name: "Voice Channels", value: message.guild.channels.cache.filter(channel => channel.type === "voice").size, inline:true},
                {name: "Members", value: members, inline:true},
                {name: "Humans", value: humans,inline:true},
                {name: "Bots", value: bots,inline:true},
                {name: "Amount of Roles", value: message.guild.roles.cache.size,inline:true},
                {name: "Amount of Categories", value: message.guild.channels.cache.filter(channel => channel.type === "category").size, inline:true},
                {name: "Roles", value:roles},
                {name: "Categories", value: categories}
            ])
            .setFooter("ID: " + message.guild.id + "|Server Created • " + message.guild.createdAt);
    }
}

module.exports = ServerinfoResponses;