const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { cyanBright, gray } = require("colorette");
const fs = require("fs");
require("dotenv").config();
const clientId = process.env.clientId;
const guildIds = process.env.guildIds.split(", ");

module.exports = (client) => {
	client.handleCommands = async (commandFolders, path) => {
		client.commandArray = [];
		for (const folder of commandFolders) {
			const commandFiles = fs
				.readdirSync(`${path}/${folder}`)
				.filter((file) => file.endsWith(".js"));
			for (const file of commandFiles) {
				const command = require(`../commands/${folder}/${file}`);
				client.commands.set(command.data.name, command);
				client.commandArray.push(command.data.toJSON());
			}
		}
		const rest = new REST({ version: "9" }).setToken(process.env.token);

		(async () => {
			try {
				console.log(
					`[${cyanBright("DEBUG")}] ${gray(
						"Started refreshing application (/) commands."
					)}`
				);

				// GUILD SLASH COMMANDS: TESTING
				for (const guildId of guildIds) {
					try {
						await rest.put(
							Routes.applicationGuildCommands(clientId, guildId),
							{ body: client.commandArray }
						);
					} catch (error) {
						console.log(error);
					}
				}

				// FOR GLOBAL SLASH COMMANDS: DEVELOPED
				// await rest.put(
				// 	Routes.applicationCommands(clientId),
				// 	{ body: client.commands },
				// );

				console.log(
					`[${cyanBright("DEBUG")}] ${gray(
						"Successfully reloaded application (/) commands."
					)}`
				);
			} catch (error) {
				console.error(error);
			}
		})();
	};
};
