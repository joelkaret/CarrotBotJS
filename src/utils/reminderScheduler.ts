import schedule from "node-schedule";
import type { Client, TextChannel } from "discord.js";
import ReminderModel, { type IReminder } from "../schemas/reminder";
import log from "./logger";

export async function fireReminder(
	reminder: IReminder,
	client: Client
): Promise<void> {
	try {
		const guild = client.guilds.cache.get(reminder.guildId);
		const channel = guild?.channels.cache.get(reminder.channelId) as
			| TextChannel
			| undefined;

		const createdAtTs = Math.floor(reminder.createdAt.getTime() / 1000);
		const content =
			`⏰ <@${reminder.userId}>, here's your reminder!\n` +
			`> ${reminder.message}\n` +
			`*Set <t:${createdAtTs}:R>*`;

		if (channel) {
			await channel.send({
				content,
				allowedMentions: {
					users: [reminder.userId],
					roles: reminder.allowedMentions.roles,
					parse: reminder.allowedMentions.everyone
						? (["everyone"] as const)
						: [],
				},
			});
		} else {
			// Channel unavailable — DM the user as fallback
			try {
				const user = await client.users.fetch(reminder.userId);
				await user.send(
					`⏰ I tried to remind you in a server but the channel is no longer available.\n` +
						`> ${reminder.message}\n` +
						`*Set <t:${createdAtTs}:R>*`
				);
			} catch {
				log.error(
					`Could not reach user ${reminder.userId} for reminder ${reminder._id.toString()}`
				);
			}
		}
	} catch (error) {
		log.error(`Failed to send reminder ${reminder._id.toString()}:`, error);
	} finally {
		try {
			await ReminderModel.findByIdAndDelete(reminder._id);
		} catch (error) {
			log.error(
				`Failed to delete reminder ${reminder._id.toString()} from DB:`,
				error
			);
		}
	}
}

export function scheduleReminder(reminder: IReminder, client: Client): void {
	const jobId = reminder._id.toString();

	if (reminder.triggerAt <= new Date()) {
		// Overdue — fire immediately
		void fireReminder(reminder, client);
		return;
	}

	schedule.scheduleJob(jobId, reminder.triggerAt, () => {
		void fireReminder(reminder, client);
	});
}

export function cancelScheduledReminder(reminderId: string): boolean {
	const job = schedule.scheduledJobs[reminderId];
	if (job) {
		job.cancel();
		return true;
	}
	return false;
}
