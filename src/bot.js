const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
require('dotenv').config();
// const { token } = require('../config.json');

client.commands = new Collection();
client.buttons = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync("./src/commands");

for (const file of functions){
	require(`./functions/${file}`)(client);
}

client.handleEvents(eventFiles);
client.handleCommands(commandFolders, `./src/commands`);
client.handleButtons();
client.login(process.env.token);
