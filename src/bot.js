const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
	intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
require('dotenv').config();
// const { token } = require('../config.json');

client.commands = new Collection();
client.buttons = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
	for (const file of functions) {
		require(`./functions/${file}`)(client);
	}
	await client.handleEvents(eventFiles);
	await client.handleCommands(commandFolders, `./src/commands`);
	await client.handleButtons();
	await client.login(process.env.token);
	await client.dbLogin();
})();