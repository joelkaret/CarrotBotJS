import mongoose from "mongoose";
import type { Connection } from "mongoose";
import type { Client } from "discord.js";
import type { MongoEventData } from "../types/bot";
import * as mongoEvents from "../mongoEvents/index";

export default (client: Client) => {
	client.dbLogin = async () => {
		for (const event of Object.values(mongoEvents) as MongoEventData[]) {
			const connection = mongoose.connection as unknown as Connection & {
				once: (
					event: string,
					listener: (...args: unknown[]) => void
				) => void;
				on: (
					event: string,
					listener: (...args: unknown[]) => void
				) => void;
			};
			if (event.once) {
				connection.once(event.name, (...args: unknown[]) =>
					event.execute(...args)
				);
			} else {
				connection.on(event.name, (...args: unknown[]) =>
					event.execute(...args)
				);
			}
		}
		mongoose.Promise = global.Promise;
		if (!process.env.dbToken) {
			throw new Error("dbToken is not defined in environment variables");
		}
		await mongoose.connect(process.env.dbToken);
	};
};
