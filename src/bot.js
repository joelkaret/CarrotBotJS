const fs = require("node:fs");
const { cyanBright, gray } = require("colorette");
const { Client, Collection } = require("discord.js");

const client = new Client({
	intents: [
		"Guilds",
		"GuildMembers",
		"GuildMessages",
		"MessageContent",
		"GuildMessageReactions",
		"GuildEmojisAndStickers",
		"GuildVoiceStates",
	],
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
	presence: {
		status: "online",
	},
	activities: [
		{
			name: "hehehe",
			type: "PLAYING",
		},
	],
});
require("dotenv").config();

client.commands = new Collection();
client.buttons = new Collection();

const functions = fs
	.readdirSync("./src/functions")
	.filter((file) => file.endsWith(".js"));

const eventFiles = fs
	.readdirSync("./src/events")
	.filter((file) => file.endsWith(".js"));

const commandFolders = fs.readdirSync("./src/commands");

try {
	(async () => {

		for (const file of functions) {
			require(`./functions/${file}`)(client);
		}

		// Initialize paintballMessageId.json if it doesn't exist or is invalid
		const paintballMessageIdFile = "src/paintballMessageId.json";
		fs.readFile(paintballMessageIdFile, "utf8", (err, data) => {
			let msgId = "";
			if (!err && data && data.trim()) {
				try {
					const parsed = JSON.parse(data);
					msgId = parsed.lastPaintballPlayerMessageId || "";
				} catch (e) {
					console.error(`[ERROR] Failed to parse ${paintballMessageIdFile}:`, e);
				}
			}

			fs.writeFile(
				paintballMessageIdFile,
				JSON.stringify({ lastPaintballPlayerMessageId: msgId }, null, 2),
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
