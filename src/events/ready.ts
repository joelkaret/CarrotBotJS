import { cyanBright, gray } from "colorette";
import type { Client } from "discord.js";

export default {
	name: "ready",
	once: true,
	execute(client: Client) {
		if (!client.user) return;
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Ready! Logged in as " + client.user.tag)}`
		);
	},
};
