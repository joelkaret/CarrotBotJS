import fs from "node:fs";
import { cyanBright, gray } from "colorette";
import {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	ActivityType,
} from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";
import "dotenv/config";
import config from "./config.js";
import type { CommandData, ButtonData } from "./types/bot.js";

// Extend Client type to include custom properties
declare module "discord.js" {
	export interface Client {
		commands: Collection<string, CommandData>;
		buttons: Collection<string, ButtonData>;
		commandArray: ReturnType<SlashCommandBuilder["toJSON"]>[];
		handleEvents: (eventFiles: string[]) => Promise<void>;
		handleCommands: (
			commandFolders: string[],
			path: string
		) => Promise<void>;
		handleButtons: () => Promise<void>;
		handleSchedules: () => Promise<void>;
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

const functions = fs
	.readdirSync("./src/functions")
	.filter((file) => file.endsWith(".ts"));

const eventFiles = fs
	.readdirSync("./src/events")
	.filter((file) => file.endsWith(".ts"));

const commandFolders = fs.readdirSync("./src/commands");

try {
	void (async () => {
		// Load function handlers
		for (const file of functions) {
			const module = (await import(`./functions/${file}`)) as {
				default: (client: Client) => void | Promise<void>;
			};
			await module.default(client);
		}

		// Initialize paintballMessageId.json if it doesn't exist or is invalid
		const paintballMessageIdFile = "src/paintballMessageId.json";
		fs.readFile(paintballMessageIdFile, "utf8", (err, data) => {
			let msgId = "";
			if (!err && data && data.trim()) {
				try {
					const parsed = JSON.parse(data) as {
						lastPaintballPlayerMessageId?: string;
					};
					msgId = parsed.lastPaintballPlayerMessageId ?? "";
				} catch (e) {
					console.error(
						`[ERROR] Failed to parse ${paintballMessageIdFile}:`,
						e
					);
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
					console.log(
						`[${cyanBright("DEBUG")}] ${gray(
							"paintballMessageId.json created/initialized."
						)}`
					);
				}
			);
		});

		await client.handleEvents(eventFiles);
		await client.handleCommands(commandFolders, `./src/commands`);
		await client.handleButtons();
		await client.handleSchedules();
		await client.login(process.env.token);
		await client.dbLogin();
	})();
} catch {
	console.log("uhoh...");
}
