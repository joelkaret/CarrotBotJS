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
	schedule.scheduleJob(rule, async function () {
		const guild = client.guilds.cache.get(guildId);
		const channel = guild?.channels.cache.find((C) => C.id == channelId) as
			| TextChannel
			| undefined;

		if (channel && guild) {
			// Fetch all members to ensure cache is up to date
			await guild.members.fetch();

			// Get all members who can view the channel
			const members = guild.members.cache.filter((member) => {
				const permissions = channel.permissionsFor(member);
				return permissions?.has("ViewChannel") ?? false;
			});

			// Pick a random member
			const randomMember = members.random();

			if (randomMember) {
				void channel.send(
					`It's Walter Wednesday! ${randomMember.toString()}, enjoy this video: ${config.walterWednesday.url}`
				);
			} else {
				// Fallback if no members found (unlikely)
				void channel.send(
					`It's Walter Wednesday! Enjoy this video: ${config.walterWednesday.url}`
				);
			}
		}
	});
};
