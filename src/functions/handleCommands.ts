import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { cyanBright, gray } from "colorette";
import fs from "fs";
import type { Client } from "discord.js";
import type { CommandData } from "../types/bot.js";
import "dotenv/config";
const clientId = process.env.clientId!;
const guildIds = process.env.guildIds!.split(", ");

export default (client: Client) => {
	client.handleCommands = async (commandFolders: string[], path: string) => {
		client.commandArray = [];
		for (const folder of commandFolders) {
			const commandFiles = fs
				.readdirSync(`${path}/${folder}`)
				.filter((file) => file.endsWith(".ts"));
			for (const file of commandFiles) {
				const commandModule = (await import(
					`../commands/${folder}/${file}`
				)) as { default: CommandData };
				const command = commandModule.default;
				client.commands.set(command.data.name, command);
				client.commandArray.push(command.data.toJSON());
			}
		}

		if (!process.env.token) {
			throw new Error(
				"Bot token is not defined in environment variables"
			);
		}

		const rest = new REST({ version: "9" }).setToken(process.env.token);

		void (async () => {
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
