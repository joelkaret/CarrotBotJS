const fs = require('node:fs');
const { exec } = require("child_process");
const { cyanBright, gray } = require("colorette")

const { Client, Events, GatewayIntentBits, ActivityType, Collection, Partials, WebhookClient } = require('discord.js');
const { Player } = require('discord-player');

const client = new Client({
	intents: [
	'Guilds',
	'GuildMembers',
	'GuildMessages',
	'GuildMessageReactions',
	'GuildEmojisAndStickers',
	'GuildVoiceStates'
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	presence: {
		status: 'online'
	},
    activities: [{
      name: 'hehehe',
      type: 'PLAYING'
    }]
});
require('dotenv').config();

// Add the player on the client
const player = new Player(client, {
  deafenOnJoin: true,
  lagMonitor: 1000,
  ytdlOptions: {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
})
client.player = player;

client.commands = new Collection();
client.buttons = new Collection();

client.player.events.on('error', (queue, error) => 
	console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`));

client.player.events.on('playerStart', (queue, track) => 
	queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`));

client.player.events.on('debug', (_queue, message) => 
	console.log(`[${cyanBright('DEBUG')}] ${gray(message)}\n`));

client.player.on("queueEnd", (queue) => {
    queue.metadata.channel.send("The queue has ended.");
});



const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync("./src/commands");
try {
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
} catch {
	exec("kill 1")
}
// exec("kill 1")

//client.login(process.env.token)

// Keep Alive
const keep_alive = require('./keep_alive.js')