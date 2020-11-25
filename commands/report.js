/* 
 * Ban a user from the server
 */

const config = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.dbuser, config.dbpass, {
    host: config.dbhost,
    dialect: 'mysql',
    logging: false
});
const ReportLogs = require('../includes/sqlReportLogs.js');
const ReportResponses = require("../responses/reportResponses.js");
module.exports = {
    name: 'report',
    description: 'Report a user for poor behavior.',
    usage: config.prefix + 'report (user tag) (reason)',
    notes: 'Users must be reported by tag (user#1234).\n'
        + "Do not attempt to @mention the user you are trying to report;\n"
        + "they will be notified!",
    async execute(message, args) {
        message.delete();
        const guild = message.client.guilds.resolve(config.guildID);
        const userTag = args.shift();
        const reason = args.join(" ");
        if (!reason) {
            return message.author.send(ReportResponses.syntaxError("You must provide a reason for your report.", message));
        }

        const reportChan = guild.channels.resolve(config.reportChannel);
        let user = userTag.split("#");
        let members = await guild.members.fetch({query: user[0]}).catch(err => {
            console.log(err);
            message.author.send(ReportResponses.apiError("Encountered an error while trying to find user."
            + " This may indicate a bug, or Discord's API may be unreachable. Please inform the moderators of this error."));
        });
        if (members.size === 0)
            return message.author.send(ReportResponses.memberNotFound(message, user.join("#")));
        const toReport = members.find(member => member.user.discriminator === user[1]);
        if (!toReport)
            return message.author.send(ReportResponses.memberNotFound(message, user.join("#")));
        //Setting these here for consistency.
        const reported = await message.client.users.fetch(toReport.id);
        const avatar = reported.displayAvatarURL();
        const tag = user.join("#");
        return sequelize.transaction(() => {
            return ReportLogs.create({
                reportedID: toReport.id,
                reporterID: message.author.id,
                message: reason
            }).catch(err => console.log(err));
        }).then(() => {
            reportChan.send(ReportResponses.newReport(toReport, avatar, tag, reason));
            message.author.send(ReportResponses.notifyUser(tag))
        })
            .catch(err => {
                console.log(err);
                reportChan.send(ReportResponses.logFailure(toReport, reason));
                message.author.send(ReportResponses.notifyUser(tag));
            });
    }
};