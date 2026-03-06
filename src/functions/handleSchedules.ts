import fs from "fs";
import { cyanBright, gray } from "colorette";
import type { Client } from "discord.js";

export default (client: Client) => {
	client.handleSchedules = async () => {
		const scheduleFolders = fs.readdirSync("./src/schedules");
		for (const folder of scheduleFolders) {
			const scheduleFiles = fs
				.readdirSync(`./src/schedules/${folder}`)
				.filter((file) => file.endsWith(".ts"));
			for (const file of scheduleFiles) {
				const scheduleModule = (await import(
					`../schedules/${folder}/${file}`
				)) as { default: (client: Client) => void };
				const schedule = scheduleModule.default;
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
		}
	};
};
