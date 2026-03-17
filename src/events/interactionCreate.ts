import type { Interaction, Client } from "discord.js";
import log from "../utils/logger";

export default {
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction, client: Client) {
		try {
			if (interaction.isCommand()) {
				const command = interaction.client.commands.get(
					interaction.commandName
				);

				if (!command) return;

				try {
					await command.execute(interaction, client);
				} catch (err) {
					if (err) log.error("Command execution error:", err);
					await interaction.reply({
						content: "An error has occured with this command.",
						ephemeral: true,
					});
				}
			} else if (interaction.isButton()) {
				const button = client.buttons.get(interaction.customId);

				if (!button) return;

				try {
					await button.execute(interaction);
				} catch (err) {
					if (err) log.error("Button execution error:", err);
					await interaction.reply({
						content: "An error has occured with this button.",
						ephemeral: true,
					});
				}
			}
		} catch (err) {
			if (err) log.error("Interaction error:", err);
		}
	},
};
