import mongoose from "mongoose";
import type { Connection } from "mongoose";
import fs from "fs";
import type { Client } from "discord.js";
import type { MongoEventData } from "../types/bot.js";
const mongoEventFiles = fs
	.readdirSync("./src/mongoEvents")
	.filter((file) => file.endsWith(".ts"));

export default (client: Client) => {
	client.dbLogin = async () => {
		for (const file of mongoEventFiles) {
			const eventModule = (await import(`../mongoEvents/${file}`)) as {
				default: MongoEventData;
			};
			const event = eventModule.default;
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
