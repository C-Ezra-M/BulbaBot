/*
 * Contains commands for modifying the spam blacklist.
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const Blacklist = require('../includes/sqlBlacklist.js');
const FilterResponses = require('../responses/filterResponses.js');

module.exports = {
    name: 'filter',
    description: 'View or modify the spam blacklist settings.',
    usage: config.prefix + 'filter (command) (parameters)...',
    notes: 'You can get help for individual filter commands with `' + config.prefix + "filter help (command)`.",
    commands: {
        add: {
            description: "Creates a new filter.",
            usage: config.prefix + "filter add (term) (--flags=) (--options=)",
            aliases: ["add", "create"]
        },
        delete: {
            description: "Deletes a filter.",
            usage: config.prefix + "filter delete (filterID)",
            aliases: ["delete", "remove"]
        },
        list: {
            description: "Lists all current filters along with their flags, options, and creator.",
            usage: config.prefix + "filter list",
            aliases: ["list", "view", "show"]
        },
        edit: {
            description: "Edit a filter, its flags, or its options.",
            usage: config.prefix + "filter edit (filterID) (term/flags/options) (new value)",
            aliases: ["modify", "change", "edit"],
            notes: "When setting flags or options, do not use spaces. Separate flags and options with commas (,)," +
                " and set options with optionname:value,option2name:value. Failure to"
                + " follow this syntax will result in your flags or options being discarded."
        },
        help: {
            description: "Get help with the filter commands.",
            usage: config.prefix + "filter help (command)"
        }
    },
    flags: {
        d: {
            description: "Delete messages which match this filter.",
            aliases: ["d", "delete", "r", "remove"]
        },
        b: {
            description: "Immediately ban a user when this filter is triggered.",
            aliases: ["b", "ban"]
        },
        k: {
            description: "Immediately kick a user when this filter is triggered.",
            aliases: ["k", "kick"]
        },
        w: {
            description: "Log a warning for users who trigger this filter.",
            aliases: ["w", "warn"]
        },
        s: {
            description: "Ban a user after a certain number of warnings are accumulated (\"softban\").",
            aliases: ["s", "softban"],
            options: ["warnlimit", "warnTime"]
        },
        n: {
            description: "Only apply this filter to new accounts and/or server members.",
            aliases: ["n", "new"],
            options: ["minimumAccountAge", "minimumServerTime"]
        },
        i: {
            description: "Treat this filter as case-insensitive."
        }
    },
    options: {
        warnLimit: {
            description: "How many warnings to accumulate before a softban is performed.",
            usage: "warnlimit:#"
        },
        warnTime: {
            description: "How close together the warnings must be for them to automatically trigger a softban.",
            usage: "warntime:(time)",
            notes: "The time can be specified in seconds (1s), minutes (1m), hours (1h), or days (1d). Example: warntime:1d"
        },
        minimumAccountAge: {
            description: "How old an account must be to bypass a filter (account creation time, not server join time).",
            usage: "minimumaccountage:(time)",
            notes: "The time can be specified in seconds (1s), minutes (1m), hours (1h), or days (1d). Example: minimumaccountage:1d"
        },
        minimumServerTime: {
            description: "How long an account must be present in the server to bypass a filter.",
            usage: "minimumservertime:(time)",
            notes: "The time can be specified in seconds (1s), minutes (1m), hours (1h), or days (1d). Example: minimumservertime:1d"
        }
    },
    async execute(message, args) {
        const modGroup = await message.guild.roles.fetch(config.modID);
        const logChan = message.guild.channels.resolve(config.logChannel);
        if (message.author.id !== config.adminID && message.member.roles.highest.position < modGroup.position)
            return logChan.send(FilterResponses.unauthorizedUser(message, "run command: " + args.join(" ")));
        const command = args.shift();
        switch (command) {
            case ("list"):
            case ("view"):
                return showFilters(message);
            case ("add"):
            case ("create"):
                return addFilter(message, args);
            case ("delete"):
            case ("remove"):
                return deleteFilter(message, args);
            case ("modify"):
            case ("edit"):
            case ("change"):
                const filterID = args.shift();
                return editFilterRoute(message, args, filterID);
            case ("help"):
                return filterHelp(message, args, this.commands, this.flags, this.options);
        }
    }
}

async function showFilters(message) {
    let data = [];
    const filters = await Blacklist.findAll();
    filters.forEach(filter => {
        const id = filter.getDataValue("id");
        const term = filter.getDataValue("term");
        const flags = filter.getDataValue("flags");
        const options = filter.getDataValue("options");
        const author = filter.getDataValue("creator");
        data.push("• Filter ID#" + id + "\n"
            + "  \"" + term + "\"\n"
            + "  Flags: " + flags + "\n"
            + "  Options: " + options + "\n"
            + "  Added by: " + author + "\n");
    });
    message.channel.send(FilterResponses.filterList(data));
}

// Syntax: ?filter add term --flags=a,s,d,f --options=minimumaccountage:1d,warnLimit:4
// args is already split(" ") so it should be like this:
// [ "term",... , "--flags=a,s,d,f", "--options=minimumaccountage:1d" ]
async function addFilter(message, args) {
    const term = args.filter(val => !val.startsWith("--")).join(" ");
    const check = await Blacklist.findOne({where: {term: term}});
    if (check)
        return message.channel.send(FilterResponses.duplicateFilter(term, check));
    let options = args.filter(val => val.startsWith("--options="))
    if (options.length) {
        options = validateOptions(options[0].split("--options=")[1].split(","));
        if (options[1].length)
            return message.channel.send(FilterResponses.invalidOptions(options[1]));
        options = options[0];
    }
    let flags = args.filter(val => val.startsWith("--flags="));
    if (flags.length) {
        flags = validateFlags(flags[0].split("--flags=")[1].split(","), options);
        if (flags[1].length) {
            return message.channel.send(FilterResponses.invalidFlags(flags[1]));
        }
        if (flags[2].length) {
            options.concat(flags[2]);
        }
        flags = flags[0].join(",");
    }
    options = options.join(",");
    // Validating the flags will set necessary options if they aren't set.
    // They are returned as the third element of the array.


    return Blacklist.create({
        term: term,
        flags: flags,
        options: options,
        creator: message.author.tag
    }).then(() => {
        message.channel.send(FilterResponses.filterCreated(term, flags, options))
    })
        .catch(err => {
            console.log(err);
            message.channel.send(FilterResponses.cannotCreateFilter);
        });
}

// Syntax: ?filter delete (id)
async function deleteFilter(message, args) {
    const id = args.shift();
    const filter = await Blacklist.findOne({where: {id: id}});
    if (!filter)
        return message.channel.send(FilterResponses.invalidFilter(id));
    await message.channel.send(FilterResponses.confirmDelete(filter)).then(mess => {
        mess.react("❌");
        mess.react("✅");
        mess.awaitReactions((reaction, user) => user.id === message.author.id && (reaction.emoji.name === "❌" || reaction.emoji.name === "✅"), {
            max: 1,
            time: 30000
        }).then(async reaction => {
            if (reaction.first().emoji.name === "✅") {
                return Blacklist.destroy({
                    where: {
                        id: id
                    }
                }).then(message.channel.send(FilterResponses.filterDeleted(id)))
                    .catch(err => {
                        console.log(err);
                        message.channel.send(FilterResponses.cannotDeleteFilter(id));
                    })
            }
        }).catch(err => {
            console.log(err);
        })
    })
}

// Syntax:
// ?filter edit/change (filter#) (type)

async function editFilterRoute(message, args, filterID) {
    const filter = await Blacklist.findOne({where: {id: filterID}}).catch(err => {
        console.log(err);
        return message.channel.send(FilterResponses.databaseReadFail);
    });
    if (!filter)
        return message.channel.send(FilterResponses.invalidFilter(filterID));
    const setting = args.shift();
    switch (setting) {
        case ("flags"):
            return editFlags(message, args, filter);
        case ("options"):
        case ("settings"):
            return editOptions(message, args, filter);
        case ("term"):
        case ("phrase"):
            return editTerm(message, args, filter);
        default:
            return message.channel.send(FilterResponses.syntaxError(message, "You need to specify if you want to edit the flags for this"
                + " filter (flags), the options (options/settings), or the blacklisted phrase itself (term/phrase)."));
    }
}

// Standardize flags for database and ensure options are set where needed
function validateFlags(flags, options) {
    console.log(flags);
    let optionsArray = [];
    options.forEach(option => {
        option = option.split(":");
        optionsArray[option[0]] = option[1];
    });
    let index = 0;
    let unknownFlags = [];
    flags.forEach(flag => {
        switch (flag.toLowerCase()) {
            // Should I delete the message?
            case ("d"):
            case ("delete"):
            case ("r"):
            case ("remove"):
                index = flags.indexOf(flag);
                flags[index] = "d";
                break;
            // Should I ban on first offense?
            case ("b"):
            case ("ban"):
                index = flags.indexOf(flag);
                flags[index] = "b";
                break;
            // Should I kick on first offense?
            case ("k"):
            case ("kick"):
                index = flags.indexOf(flag);
                flags[index] = "k";
                break;
            // Should I log a warning in the modlogs table?
            case ("warn"):
            case ("w"):
                index = flags.indexOf(flag);
                flags[index] = "w";
                break;
            // Should I ban after a certain number of warnings?
            case ("s"):
            case ("softban"):
                if (!optionsArray["warnlimit"])
                    options.push("warnlimit:3")
                if (!optionsArray["warntime"])
                    options.push("warntime:0");
                index = flags.indexOf(flag);
                flags[index] = "s";
                break;
            // Should this rule only apply to new members?
            case ("new"):
            case ("newmember"):
            case ("n"):
                if (!optionsArray["minimumaccountage"] && !optionsArray["minimumservertime"])
                    options.push("minimumservertime:1h");
                index = flags.indexOf(flag);
                flags[index] = "n";
                break;
            case ("i"):
            case ("ci"):
                index = flags.indexOf(flag);
                flags[index] = "i";
                break;
            // Unrecognized flag
            default:
                index = flags.indexOf(flag);
                flags[index] = "";
                unknownFlags.push(flag);
        }
    });
    if (flags.indexOf("s") !== -1 && flags.indexOf("w") === -1)
        flags.push("w"); // Softban should always warn
    console.log(flags, unknownFlags);
    return [flags, unknownFlags, options];
}

// args should only have a command
function filterHelp(message, args, commands, flags, options) {
    let command = "";
    if (!args.length)
        command = "";
    else command = args.shift();
    switch (command) {
        case ("list"):
        case ("view"):
            return message.channel.send(FilterResponses.filterCommandHelp(commands.list, "List"));
        case ("add"):
        case ("create"):
            return message.channel.send(FilterResponses.filterCommandHelp(commands.add, "Add"));
        case ("delete"):
        case ("remove"):
            return message.channel.send(FilterResponses.filterCommandHelp(commands.delete, "Delete"));
        case ("change"):
        case ("modify"):
        case ("edit"):
            return message.channel.send(FilterResponses.filterCommandHelp(commands.edit, "Edit"));
        case ("flags"):
            return message.channel.send(FilterResponses.filterFlagsHelp(flags));
        case ("options"):
        case ("settings"):
            return message.channel.send(FilterResponses.filterOptionsHelp(options));
        case (""):
            return message.channel.send(FilterResponses.listFilterCommands(commands));
        default:
            return message.channel.send(FilterResponses.unknownCommandHelp(command));
    }
}

async function editFlags(message, args, filter) {
    let flags = args.shift().split(",");
    let badFlags = [];
    const allFlags = validateFlags(flags, filter.getDataValue("options").split(":"));
    if (allFlags[1].length)
        badFlags = allFlags[1];
    if (badFlags.length)
        message.channel.send(FilterResponses.invalidFlags(badFlags.join(",")));
    const goodFlags = allFlags[0].join(",");
    if (!goodFlags)
        return message.channel.send(FilterResponses.flagsNotUpdated);
    filter.update({flags: goodFlags})
        .then(() => {
            message.channel.send(FilterResponses.flagsUpdated(filter, goodFlags))
        })
        .catch(err => {
            console.log(err);
            message.channel.send(FilterResponses.flagsUpdateFailed);
        });
}

async function editOptions(message, args, filter) {
    let options = args.split(",");
    const allOptions = validateOptions(options);
    let badOptions = [];
    if (allOptions[1].length)
        badOptions = allOptions[1];
    if (badOptions.length)
        message.channel.send(FilterResponses.invalidOptions(badOptions.join(",")));
    const goodOptions = allOptions[0].join(",");
    if (!goodOptions)
        return message.channel.send(FilterResponses.optionsNotUpdated)
    filter.update({options: goodOptions})
        .then(() => {
            message.channel.send(FilterResponses.optionsUpdated(filter, goodOptions));
        })
        .catch(err => {
            console.log(err);
            return message.channel.send(FilterResponses.optionsUpdateFailed)
        })
}

// Pass options as an array
// ["option1:val", "option2:val"]

function validateOptions(options) {
    const validOptions = Object.keys(module.exports.options).map(option => option.toLowerCase());
    let badOptions = [];
    options.forEach(option => {
        const optionPair = option.split(":");
        const name = optionPair[0];
        const value = optionPair[1];
        if (validOptions.indexOf(name) === -1) {
            badOptions.push(name + value);
            let index = options.indexOf(option);
            options.splice(index, 1);
        }
        if (name !== "warnlimit") {
            let measure = value.trim().toLowerCase().slice(-1);
            let duration = value.trim().toLowerCase().slice(0, 1);
            if (measure !== "s" && measure !== "m" && measure !== "h" && measure !== "d" || !isNumeric(duration)) {
                badOptions.push(name + value);
                let index = options.indexOf(option);
                options.splice(index, 1);
            }
        }
        if (name === "warnlimit" && !isNumeric(value)) {
            badOptions.push(name + value);
            let index = options.indexOf(option);
            options.splice(index, 1);
        }
    })
    return [options, badOptions];
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

async function editTerm(message, args, filter) {
    const term = args.join(" ");
    filter.update({term: term})
        .then(() => {
            return message.channel.send(FilterResponses.filterUpdated(filter, term));
        })
        .catch(err => {
            console.log(err);
            return message.channel.send(FilterResponses.filterUpdateFailed);
        })
}
