import type { Client } from "discord.js";
import type { EventData } from "../types/bot.js";
import * as events from "../events/index.js";

export default (client: Client) => {
	client.handleEvents = () => {
		for (const event of Object.values(events) as EventData[]) {
			if (event.once) {
				client.once(event.name, (...args: unknown[]) =>
					event.execute(...args, client)
				);
			} else {
				client.on(event.name, (...args: unknown[]) =>
					event.execute(...args, client)
				);
			}
		}
	};
};
