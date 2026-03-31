import type { Client } from "discord.js";
import ReminderModel from "../schemas/reminder";
import { scheduleReminder } from "../utils/reminderScheduler";
import log from "../utils/logger";

export default (client: Client) => {
	client.handleReminders = async () => {
		const reminders = await ReminderModel.find({
			triggerAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, // include up to 5 min overdue
		});

		for (const reminder of reminders) {
			scheduleReminder(reminder, client);
		}

		log.debug(`Loaded ${reminders.length} pending reminder(s) from DB`);
	};
};
