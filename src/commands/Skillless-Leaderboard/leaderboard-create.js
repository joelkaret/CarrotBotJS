const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard-create')
		.setDescription("Update a leaderboard"),
	async execute(interaction, client) {
		if (!(interaction.member.roles.cache.some(role => role.name === 'Guild Staff') || String(interaction.member.id) == "506884005195677696")){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		await interaction.deferReply({ ephemeral: true })
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('refresh')
				.setLabel('🗘Refresh')
				.setStyle('Success'),
		);
		const overall = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: 'Overall', value: `\u200B`, inline: false })
		const solos = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: 'Solos', value: `\u200B`, inline: false })
		const doubles = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: 'Doubles', value: `\u200B`, inline: false })
		const threes = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: 'Threes', value: `\u200B`, inline: false })
		const fours = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: 'Fours', value: `\u200B`, inline: false })
		const fourVsFour = new EmbedBuilder()
			.setColor('#2C2F33')
			.addFields({ name: '4v4', value: `\u200B`, inline: false })
		await interaction.channel.send({ embeds: [overall], components: [row] });
		await interaction.channel.send({ embeds: [solos], components: [row] });
		await interaction.channel.send({ embeds: [doubles], components: [row] });
		await interaction.channel.send({ embeds: [threes], components: [row] });
		await interaction.channel.send({ embeds: [fours], components: [row] });
		await interaction.channel.send({ embeds: [fourVsFour], components: [row] });
		await interaction.editReply({ content: 'Done!', ephemeral: true })
	}
};
