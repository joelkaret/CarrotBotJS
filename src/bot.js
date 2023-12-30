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

// Walter Wednesday Skillless
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = 3;
rule.hour = 12;
rule.minute = 0;
rule.tz = 'America/Atikokan' // EST

const job = schedule.scheduleJob(rule, function(){
	const skilllessGuildId = "713646548436910116";
	const channelId = "759265396901150761"
	let channel = skilllessGuildId.channels.cache.find(
                (C) => C.id == channelId
            );
	if (channel) {
		channel.send('https://cdn.discordapp.com/attachments/852716030601330740/1190718826766143520/walter_wedsendy.mp4?ex=65a2d252&is=65905d52&hm=ad65957d76fec08992c35123391585335b9e8daeebad755cd475faa79273e9bb&');
	}
});


// exec("kill 1")

//client.login(process.env.token)

// Keep Alive
// const keep_alive = require('./keep_alive.js')
