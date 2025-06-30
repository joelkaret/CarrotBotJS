const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

require("dotenv").config();
const config = require("../../config.js");
const chimingClockGuildId = config.chimingClock.guildId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("dino-ldb")
		.setDescription("Create the dino ldb"),
	async execute(interaction, client) {
		if ((interaction.guildId !== chimingClockGuildId)) {
			await interaction.reply({
				content: `${interaction.member} You do not have permssion to do this. (Carrot club OP)`,
				ephemeral: true,
			});
			return;
		}
		await interaction.deferReply({ ephemeral: true });
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("refreshDino")
				.setLabel("🗘Refresh")
				.setStyle("Success")
		);
		const leaderboard = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Leaderboard", value: `\u200B`, inline: false });
		await interaction.channel.send({
			embeds: [leaderboard],
			components: [row],
		});
		await interaction.editReply({ content: "Done!", ephemeral: true });
	},
};
