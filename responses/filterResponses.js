/*
 * Responses for the filter command
 */

const Discord = require("discord.js");
const config = require('../config.json');
const FilterResponses = {
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

    filterList(data) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Blacklisted Terms")
            .setDescription(data)
            .setTimestamp();
    },


    filterCommandHelp(command, name) {
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle(name)
            .setDescription(command.description)
            .addField("Usage:", command.usage)
            .setTimestamp();
        if (command.aliases)
            return response.addField("Aliases:", command.aliases);
        return response
    },

    filterFlagsHelp(flags) {
        let fields = [];
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Flags")
            .setDescription("This is a list of all available filter flags and their functions.")
            .setTimestamp()
        for (let [flag, object] of Object.entries(flags)) {
            let aliases = "";
            let options = "";
            console.log(object);
            if (object.aliases)
                aliases = "\nAliases: " + object.aliases.join(", ").trim();
            if (object.options)
                options = "\nOptions: " + object.options.join(", ").trim();
            fields.push({
                name: flag,
                value: object.description + aliases + options
            });
        }
        return response.addFields(fields);
    },

    filterOptionsHelp(options) {
        let fields = [];
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Options")
            .setDescription("This is a list of all available filter options."
                + " Note that these are flag-specific and will be ignored if the respective flag is not set.")
            .setTimestamp();
        for (let [option, object] of Object.entries(options)) {
            let notes = "";
            if (object.notes)
                notes = "\nNotes: " + object.notes;
            fields.push({
                name: option,
                value: object.description + "\nUsage: " + object.usage + notes
            });
        }
        return response.addFields(fields);
    },

    filterCreated(term, flags, options) {
        let fields = [];
        const response = new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter Created Successfully")
            .setDescription("Filter has been successfully created for \"" + term + ".\"")
            .setTimestamp();
        if (flags)
            fields.push({name: "Flags:", value: flags});
        if (options)
            fields.push({name: "Options:", value: options});
        if (fields.length)
            return response.addFields(fields);
        else return response;
    },

    filterDeleted(id) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter Deleted")
            .setDescription("Filter #" + id + " has been successfully deleted.")
            .setTimestamp();
    },
    cannotDeleteFilter(id) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Delete Filter")
            .setDescription("Attempt to delete filter #" + id + " failed. You should try running the command again," +
                " and contact the bot's administrator if the issue persists.")
            .setTimestamp();
    },
    invalidFilter(filterID) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter not Found")
            .setDescription("No filter found with ID# " + filterID + ". You can check current filters with `" + config.prefix
                + "filter list`.")
            .setTimestamp();
    },
    syntaxError(message, error) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Syntax Error")
            .setDescription(error)
            .addField("Command:", message.content)
            .setTimestamp();
    },
    unknownCommandHelp(command) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Invalid Filter Command")
            .setDescription("\"" + command + "\" is not a valid filter command. You can list the filter commands with `"
                + config.prefix + "filter help`")
            .setTimestamp();
    },
    cannotCreateFilter:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Create Filter")
            .setDescription("There was an error while attempting to create a new filter. You should try running the command "
                + "again, and contact the bot's administrator if the issue persists."),

    invalidFlags(badFlags) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Invalid Flags Detected")
            .setDescription("Some or all of your flags are invalid. If you need to view a list of valid flags,"
                + " use the `" + config.prefix + "filter help flags` command.")
            .addField("Rejected Flags:", badFlags)
            .setTimestamp();
    },
    invalidOptions(badOptions) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Invalid Options Detected")
            .setDescription("Some or all of your options are invalid. If you need to view a list of valid options,"
                + " use the `" + config.prefix + "filter help options` command.")
            .addField("Rejected Options:", badOptions)
            .setTimestamp();
    },
    optionsNotUpdated:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Options Not Updated")
            .setDescription("I was unable to find any valid options among your input. Please double-check your syntax and" +
                " try again.")
            .setTimestamp(),

    optionsUpdated(filter, goodOptions) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Options Updated")
            .setDescription("Filter #" + filter.getDataValue("id") + ".")
            .addField("Options:", goodOptions)
            .setTimestamp();
    },
    optionsUpdateFailed:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Update Options")
            .setDescription("There was an error while attempting to update filter options. You should try running the command again"
                + " and contact the bot's administrator if the issue persists.")
            .setTimestamp(),

    flagsNotUpdated:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Flags Not Updated")
            .setDescription("I was unable to find any valid flags among your input. Please double-check your syntax and" +
                " try again.")
            .setTimestamp(),
    flagsUpdated(filter, goodFlags) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Flags Updated")
            .setDescription("Filter #" + filter.getDataValue("id") + " has been updated.")
            .addField("Flags:", goodFlags)
            .setTimestamp();
    },
    flagsUpdateFailed:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Update Flags")
            .setDescription("There was an error while attempting to update filter flags. You should try running the command again"
                + " and contact the bot's administrator if the issue persists.")
            .setTimestamp(),

    filterUpdated(filter, term) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter Updated")
            .setDescription("Filter #" + filter.getDataValue("id") + " has been updated.")
            .addField("New Term:", term);
    },
    filterUpdateFailed:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Update Filter")
            .setDescription("There was an error while attempting to update the filter term. You should try running the command again"
                + " and contact the bot's administrator if the issue persists.")
            .setTimestamp(),
    listFilterCommands(commands) {
        let fields = [];
        for (let [command, object] of Object.entries(commands)){
            let aliases = [];
            let notes = "";
            if (object.aliases)
                aliases = "\nAliases: " + object.aliases.join(", ").trim();
            else aliases = "";
            if (object.notes)
                notes = "\nNotes: " + object.notes;
            fields.push({name: command, value: "Description: " + object.description + "\n"
            + "Usage: " + object.usage + aliases + notes})
        }
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Filter Commands")
            .setDescription("This is a list of all available filter commands.")
            .addFields(fields);
    },
    duplicateFilter(term, filter) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Duplicate Filter")
            .setDescription('"' + term + '" already exists under filter #' + filter.getDataValue("id") + ".");
    },
    confirmDelete(filter) {
        return new Discord.MessageEmbed()
            .setColor(config.messageColors.filter)
            .setTitle("Confirm Filter Deletion")
            .setDescription("Are you sure you'd like to delete filter #" + filter.getDataValue("id") + " (" + filter.getDataValue("term") + ")?\n"
            + "Select a reaction to continue.")

    },
    databaseReadFail:
        new Discord.MessageEmbed()
            .setColor(config.messageColors.error)
            .setTitle("Failed to Read Database")
            .setDescription("An error occurred while attempting to access the database. Please inform the bot's administrator.")
            .setTimestamp(),

}

module.exports = FilterResponses;