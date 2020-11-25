/*
 * Responses for the whois command
 */

const Discord = require("discord.js");
const config = require('../config.json');

const WhoisResponses = {
    unauthorizedUser(message, command) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.misuseWarn)
            .setAuthor("Unauthorized User", message.author.displayAvatarURL())
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription("Unprivileged user " + message.author.tag + " attempted to " + command)
            .addField("Message", message.content)
            .setFooter("ID:", message.author.id)
            .setTimestamp();
    },

    showInfo(user, member, status, game){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.whois)
            .setAuthor(user.tag, user.displayAvatarURL())
            .setThumbnail(user.displayAvatarURL())
            .addFields([
                {name: "ID", value: user.id, inline: true},
                {name: "Nickname", value: member.nickname? member.nickname:"None", inline:true},
                {name: "Status", value: status[0], inline:true},
                {name: "Game", value: game[0] , inline:true},
                {name: "Joined", value: member.joinedAt, inline:true},
                {name: "Registered", value: user.createdAt, inline:true},
                {name: "Roles", value: member.roles.cache.size > 1 ? member.roles.cache.map(role => {if (role.name !== "@everyone") return role.name + ", ";}).filter(role => {return role !== null}).join("").trim().slice(0, -1):"None",inline:true}
            ])
            .setTimestamp();
    },

    userNotFound(message, id) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("User Not Found")
            .setDescription('No user found with ID "' + id + '."')
            .addField("Command:", message.content)
            .setTimestamp();
    },
}

module.exports = WhoisResponses;