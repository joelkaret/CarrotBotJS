import { SlashCommandBuilder } from "@discordjs/builders";
import type {
	ChatInputCommandInteraction,
	Client,
	TextChannel,
} from "discord.js";
import "dotenv/config";

import config from "../../config";
const botOwner = config.userIds.botOwner;

export default {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription("Purge messages in a channel")
		.addIntegerOption((option) =>
			option
				.setName("number")
				.setDescription("Number of messages to purge.")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		if (interaction.user.id !== botOwner) {
			await interaction.reply({
				content: `${interaction.user.toString()} You do not have permssion to do this.`,
				ephemeral: true,
			});
			return;
		}
		const number = interaction.options.getInteger("number");
		if (!interaction.channel) return;
		await (interaction.channel as TextChannel).bulkDelete(number!);
		await interaction.reply({
			content: `Deleted ${number} messages`,
			ephemeral: true,
		});
	},
};
