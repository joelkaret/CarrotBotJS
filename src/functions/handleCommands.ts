import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import log from "../utils/logger";
import type { Client } from "discord.js";
import type { CommandData } from "../types/bot";
import * as commands from "../commands/index";
import "dotenv/config";

const clientId = process.env.clientId!;
const guildIds = process.env.guildIds!.split(", ");

export default (client: Client) => {
	client.handleCommands = () => {
		client.commandArray = [];

		for (const command of Object.values(commands) as CommandData[]) {
			client.commands.set(command.data.name, command);
			client.commandArray.push(command.data.toJSON());
		}

		if (!process.env.token) {
			throw new Error(
				"Bot token is not defined in environment variables"
			);
		}

		const rest = new REST({ version: "9" }).setToken(process.env.token);

		void (async () => {
			try {
				log.debug("Started refreshing application slash (/) commands.");

				// GUILD SLASH COMMANDS: TESTING
				for (const guildId of guildIds) {
					try {
						await rest.put(
							Routes.applicationGuildCommands(clientId, guildId),
							{ body: client.commandArray }
						);
					} catch (error) {
						log.error(
							"Error registering commands for guild:",
							error
						);
					}
				}

				// FOR GLOBAL SLASH COMMANDS: DEVELOPED
				// await rest.put(
				// 	Routes.applicationCommands(clientId),
				// 	{ body: client.commands },
				// );

				log.debug(
					"Successfully reloaded application slash (/) commands."
				);
			} catch (error) {
				log.error(
					"Error reloading application slash (/) commands:",
					error
				);
			}
		})();
	};
};
