import { cyanBright, gray } from "colorette";
import type { Client } from "discord.js";
import * as schedules from "../schedules/index.js";

export default (client: Client) => {
	client.handleSchedules = () => {
		for (const schedule of Object.values(schedules) as Array<
			(client: Client) => void
		>) {
			try {
				schedule(client);
				console.log(
					`[${cyanBright("DEBUG")}] ${gray(
						"Schedule deployed successfully"
					)}`
				);
			} catch (error) {
				console.log(
					`[${cyanBright("DEBUG")}] ${gray(String(error))}\n`
				);
			}
		}
	};
};
