import log from "../utils/logger";
import type { Client } from "discord.js";

export default {
	name: "ready",
	once: true,
	execute(client: Client) {
		if (!client.user) return;
		log.debug("Ready! Logged in as " + client.user.tag);
	},
};
