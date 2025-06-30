const schedule = require("node-schedule");

const config = require("../../config.js");
const guildId = config.walterWednesday.guildId;
const channelId = config.walterWednesday.channelId;
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = config.walterWednesday.rule.dayOfWeek;
rule.hour = config.walterWednesday.rule.hour;
rule.minute = config.walterWednesday.rule.minute;
rule.tz = config.walterWednesday.rule.tz;

module.exports = (client) => {
	schedule.scheduleJob(rule, function () {
		const guild = client.guilds.cache.get(guildId);
		let channel = guild.channels.cache.find(
			(C) => C.id == channelId
		);
		if (channel) {
			channel.send(
				`It's Walter Wednesday! Enjoy this video: ${config.walterWednesday.url}`
			);
		}
	});
};
