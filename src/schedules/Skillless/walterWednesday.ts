import schedule from "node-schedule";
import type { Client, TextChannel } from "discord.js";

import config from "../../config";
const guildId = config.walterWednesday.guildId;
const channelId = config.walterWednesday.channelId;
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = config.walterWednesday.rule.dayOfWeek;
rule.hour = config.walterWednesday.rule.hour;
rule.minute = config.walterWednesday.rule.minute;
rule.tz = config.walterWednesday.rule.tz;

export default (client: Client) => {
	schedule.scheduleJob(rule, function () {
		const guild = client.guilds.cache.get(guildId);
		const channel = guild?.channels.cache.find((C) => C.id == channelId) as
			| TextChannel
			| undefined;
		if (channel) {
			void channel.send(
				`It's Walter Wednesday! Enjoy this video: ${config.walterWednesday.url}`
			);
		}
	});
};
