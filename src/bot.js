const fs = require("node:fs");
const { exec } = require("child_process");
const { cyanBright, gray } = require("colorette");
const { Client, Collection } = require("discord.js");

const client = new Client({
	intents: [
		"Guilds",
		"GuildMembers",
		"GuildMessages",
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
		fs.writeFile("src/dinoReacted.txt", "true", (err) => {
			if (err) throw err;
			console.log(
				`[${cyanBright("DEBUG")}] ${gray(
					"dinoReacted.txt created successfully."
				)}`
			);
		});
		fs.writeFile("src/lastDino.txt", "", (err) => {
			if (err) throw err;
			console.log(
				`[${cyanBright("DEBUG")}] ${gray(
					"lastDino.txt created successfully."
				)}`
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
	exec("kill 1");
}
