import log from "../utils/logger";
import type { Client } from "discord.js";
import * as schedules from "../schedules/index";

export default (client: Client) => {
	client.handleSchedules = () => {
		for (const schedule of Object.values(schedules) as Array<
			(client: Client) => void
		>) {
			try {
				schedule(client);
				log.debug("Schedule deployed successfully");
			} catch (error) {
				log.error("Schedule deployment error:", error);
			}
		}
	};
};
