import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, ButtonStyle } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, GuildMember } from "discord.js";
import type { ChatInputCommandInteraction, Client, Role } from "discord.js";
import "dotenv/config";
import config from "../../config.js";
const leaderboardEditPermissionRoleName = config.bedwarsLeaderboard.roleName;
const botOwner = config.userIds.botOwner;

export default {
	data: new SlashCommandBuilder()
		.setName("leaderboard-create")
		.setDescription("Update a leaderboard"),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		if (!interaction.member || !(interaction.member instanceof GuildMember))
			return;
		if (
			!(
				interaction.member.roles.cache.some(
					(role: Role) =>
						role.name === leaderboardEditPermissionRoleName
				) || String(interaction.member.id) == botOwner
			)
		) {
			await interaction.reply({
				content: `${interaction.member.toString()} You do not have permssion to do this.`,
				ephemeral: true,
			});
			return;
		}
		await interaction.deferReply({ ephemeral: true });
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("refresh")
				.setLabel("🗘Refresh")
				.setStyle(ButtonStyle.Success)
		);
		const overall = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Overall", value: `\u200B`, inline: false });
		const solos = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Solos", value: `\u200B`, inline: false });
		const doubles = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Doubles", value: `\u200B`, inline: false });
		const threes = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Threes", value: `\u200B`, inline: false });
		const fours = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "Fours", value: `\u200B`, inline: false });
		const fourVsFour = new EmbedBuilder()
			.setColor("#2C2F33")
			.addFields({ name: "4v4", value: `\u200B`, inline: false });
		if (!interaction.channel) return;
		await interaction.channel.send({
			embeds: [overall],
			components: [row],
		});
		await interaction.channel.send({ embeds: [solos], components: [row] });
		await interaction.channel.send({
			embeds: [doubles],
			components: [row],
		});
		await interaction.channel.send({ embeds: [threes], components: [row] });
		await interaction.channel.send({ embeds: [fours], components: [row] });
		await interaction.channel.send({
			embeds: [fourVsFour],
			components: [row],
		});
		await interaction.editReply({ content: "Done!" });
	},
};
