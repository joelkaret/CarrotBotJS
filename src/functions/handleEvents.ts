import type { Client } from "discord.js";
import type { EventData } from "../types/bot.js";

export default (client: Client) => {
	client.handleEvents = async (eventFiles: string[]) => {
		for (const file of eventFiles) {
			const eventModule = (await import(`../events/${file}`)) as {
				default: EventData;
			};
			const event = eventModule.default;
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
