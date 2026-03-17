import fs from "node:fs";
import {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	ActivityType,
} from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";
import "dotenv/config";
import config from "./config";
import log from "./utils/logger";
import type { CommandData, ButtonData } from "./types/bot";
import * as functions from "./functions/index";

// Extend Client type to include custom properties
declare module "discord.js" {
	export interface Client {
		commands: Collection<string, CommandData>;
		buttons: Collection<string, ButtonData>;
		commandArray: ReturnType<SlashCommandBuilder["toJSON"]>[];
		handleEvents: () => void;
		handleCommands: () => void;
		handleButtons: () => void;
		handleSchedules: () => void;
		dbLogin: () => Promise<void>;
		ldbAdd: (
			ign: string,
			uuid: string,
			winstreak: number,
			mode: string
		) => Promise<void>;
	}
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
	presence: {
		status: "online",
		activities: [
			{
				name: config.bot.activityName,
				type: ActivityType.Playing,
			},
		],
	},
});

client.commands = new Collection();
client.buttons = new Collection();

try {
	void (async () => {
		// Load function handlers
		for (const handler of Object.values(functions)) {
			handler(client);
		}

		// Initialize paintballMessageId.json if it doesn't exist or is invalid
		const paintballMessageIdFile = "paintballMessageId.json";
		fs.readFile(paintballMessageIdFile, "utf8", (err, data) => {
			let msgId = "";
			if (!err && data && data.trim()) {
				try {
					const parsed = JSON.parse(data) as {
						lastPaintballPlayerMessageId?: string;
					};
					msgId = parsed.lastPaintballPlayerMessageId ?? "";
				} catch (e) {
					log.error(`Failed to parse ${paintballMessageIdFile}:`, e);
				}
			}

			fs.writeFile(
				paintballMessageIdFile,
				JSON.stringify(
					{ lastPaintballPlayerMessageId: msgId },
					null,
					2
				),
				(writeErr) => {
					if (writeErr) throw writeErr;
					log.debug("paintballMessageId.json created/initialized.");
				}
			);
		});

		client.handleEvents();
		client.handleCommands();
		client.handleButtons();
		client.handleSchedules();
		await client.login(process.env.token);
		await client.dbLogin();
	})();
} catch (error) {
	log.error("Fatal error during bot initialization:", error);
}
