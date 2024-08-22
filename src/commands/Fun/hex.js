const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hex")
		.setDescription("Displays hex colour codes for Discord buttons."),
	async execute(interaction, client) {
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("primary")
				.setLabel("Primary")
				.setStyle("PRIMARY"),
			new ButtonBuilder()
				.setCustomId("success")
				.setLabel("Success")
				.setStyle("SUCCESS"),
			new ButtonBuilder()
				.setCustomId("danger")
				.setLabel("Danger")
				.setStyle("DANGER")
		);
		await interaction.reply({
			content: "Click buttons to get their hex colour code:",
			components: [row],
		});
	},
};
