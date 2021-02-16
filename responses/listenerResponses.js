/*
 * These are the responses used by the main listeners in index.js
 */

const Discord = require('discord.js');
const config = require('../config.json');

const ListenerResponses = {
    apiError(details, fields = []){
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("API Error")
            .setDescription(details)
            .setTimestamp();
        if (fields.length)
            return response.addFields(fields);
        else return response;
    },

    avatarUpdated: new Discord.MessageEmbed()
        .setColor(config.messageColors.startup)
        .setTitle("Bot Avatar Updated")
        .setDescription("Avatar set from: " + config.updateAvatar)
        .setTimestamp(),

    startUp: new Discord.MessageEmbed()
        .setColor(config.messageColors.startup)
        .setTitle("Bot Restarted")
        .setDescription("Restarted successfully. Checking for updates and pending actions.")
        .setTimestamp(),

    warningMentions(message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memWarn)
            .setTitle("Warning")
            .setDescription("Your message in " + message.channel.toString() + " has been automatically deleted "
                + "because you mentioned too many users.\n" +
                "The moderators have been notified. Do not attempt to post the message again."
                + " If you have any questions, you may contact the moderators.")
            .addField("Your Message:", message.content)
            .setTimestamp();
    },

    cannotMessageUser(user){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Unable to Send Message")
            .setDescription("Attempt to send message to " + user.tag + " failed. This likely a result of their privacy settings.")
            .setTimestamp();
    },

    tooManyMentions(user, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.messageDelete)
            .setAuthor("Message Deleted", user.displayAvatarURL())
            .setDescription("Message by " + user.tag + " automatically deleted; too many user mentions.")
            .addFields([
                {name: "Message:", value: message.content},
                {name: "ID:", value: user.id, inline: true}
            ])
            .setTimestamp();
    },

    warningInvite(message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memWarn)
            .setTitle("Warning")
            .setDescription("Sending Discord invites in " + message.guild.name + " is not allowed."
                + " Your message in " + message.channel.toString() + " was automatically deleted, and the moderators"
                + " have been notified. Do not attempt to post the link again. If you have any questions, you"
                + " may contact the moderators.")
            .addField("Your Message:", message.content)
            .setTimestamp();
    },

    inviteDeleted(user, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.messageDelete)
            .setTitle("Messaged Deleted")
            .setDescription("Messaged by " + user.tag + " (" + user.id + ") automatically deleted because it contained"
                + " a Discord invite link.")
            .addField("Message:", message.content)
            .setFooter("ID: " + user.id)
            .setTimestamp();
    },

    commandError(command, message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Command Execution Error")
            .setDescription("Failed to execute command " + config.prefix + command + ". This error has been logged, "
                + "but you should also alert the bot's administrator, as this probably indicates a bug.")
            .addField("Command:", message.content)
            .setTimestamp();
    },

    cannotDeleteMessage(message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Delete Message")
            .setDescription("I was unable to delete a message by user "
                + message.author.tag + " matching my filters in #"
                + message.channel.toString() + ". Are my permissions set incorrectly?")
            .addField("Message:", message.content)
            .setFooter("User ID: " + message.author.id)
            .setTimestamp();
    },

    memberJoin(member){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memJoin)
            .setAuthor('Member Joined', member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription("<@!" + member.id + "> (" + member.user.tag + ")")
            .addField('Account created at: ', member.user.createdAt)
            .setFooter("ID: " + member.id)
            .setTimestamp();
    },

    memberRemuted(member, mute){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memMute)
            .setTitle("Active Mute Detected")
            .setDescription("New user " + member.user.tag + " has an outstanding mute."
            + "Their mute has been re-applied, and will expire at " + mute.getDataValue("unmutedTime"))
            .setFooter("ID: " + member.id)
            .setTimestamp();
    },

    messageEdited(oldMessage, newMessage){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.messageEdit)
            .setAuthor('Message Edited by ' + newMessage.author.tag, newMessage.author.displayAvatarURL())
            .setThumbnail(newMessage.author.displayAvatarURL())
            .setDescription("Message edited in " + oldMessage.channel.toString())
            .addFields([
                {name: "Before:", value: oldMessage.content},
                {name: "After:", value: newMessage.content},
            ])
            .setFooter("ID: " + newMessage.author.id)
            .setTimestamp();
    },

    messageDeleted(message){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.messageDelete)
            .setAuthor("Message Deleted by " + message.author.tag, message.author.displayAvatarURL())
            .setDescription("Message sent by <@!" + message.author.id + "> deleted.")
            .addField("Message in #" + message.channel.name + ":", message.content)
            .setFooter("ID: " + message.author.id)
            .setTimestamp();
    },

    embedMessageDeleted(message){
        let title = "";
        if (!message.embeds[0].title)
            title = message.embeds[0].author.name;
        else title = message.embeds[0].title;
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.messageDelete)
            .setAuthor("Message Deleted by " + message.author.tag, message.author.displayAvatarURL())
            .setDescription("Message with embeds deleted.")
            .addFields([{ name: "Message in #" +message.channel.name, value: "(Embed)"},
                {name: "Embed Title", value: title},
                {name: "Embed Text", value: message.embeds[0].description}])
            .setFooter("ID: " + message.author.id)
            .setTimestamp();
    },

    memberLeave(member){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memLeave)
            .setAuthor("Member Left", member.user.displayAvatarURL())
            .setDescription("<@!" + member.id + "> (" + member.user.tag + ")")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter("ID: " + member.id)
            .setTimestamp();
    },

    unmutesSchedule(fields){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.startUp)
            .setTitle("Unmutes Scheduled")
            .setDescription("Unmutes scheduled for the following users:")
            .addFields(fields)
            .setTimestamp();
    },

    // Message that logs an expired mute.
    muteExpireLog(member, duration){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnmute)
            .setTitle("Mute Expired for " + member.user.tag)
            .setDescription("<@!" + member.id + "> (" + member.user.username + ") is now unmuted (" + duration + " mute).")
            .setTimestamp()
    },

    // Message sent to the user informing them their mute is expired.
    muteExpireUser(guild){
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.memUnban)
            .setTitle("Mute Expired")
            .setDescription("Your mute in " + guild.name + " has expired. Please review the rules to avoid future moderation action.")
            .setTimestamp();
    },


    filterActions(filterID, message, actions) {
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter #" + filterID + " Tripped")
            .setDescription("User " + message.author.tag + " triggered filter #" + filterID)
            .addField("Message:", message.content);
        if (actions.length){
            response.addField("The following actions have been taken:", actions.join("\n"));
        }
        return response;
    }
}

module.exports = ListenerResponses;