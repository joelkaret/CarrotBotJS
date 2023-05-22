const fs = require('node:fs');
const Discord = require('discord.js');
const client = new Discord.Client({
	intents: [
	Discord.GatewayIntentBits.Guilds,
	Discord.GatewayIntentBits.GuildMessages,
	Discord.GatewayIntentBits.GuildMessageReactions,
	Discord.GatewayIntentBits.GuildEmojisAndStickers,
	Discord.GatewayIntentBits.GuildMessageReactions
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
require('dotenv').config();
// const { token } = require('../config.json');

client.commands = new Discord.Collection();
client.buttons = new Discord.Collection();

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