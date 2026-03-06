import { SlashCommandBuilder } from "@discordjs/builders";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Client,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("hex")
		.setDescription("Displays hex colour codes for Discord buttons."),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("primary")
				.setLabel("Primary")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("success")
				.setLabel("Success")
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId("danger")
				.setLabel("Danger")
				.setStyle(ButtonStyle.Danger)
		);
		await interaction.reply({
			content: "Click buttons to get their hex colour code:",
			components: [row],
		});
	},
};
