const { request } = require('undici');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard-add')
		.setDescription("Add a user to the leaderboard.")
		.addStringOption(option => 
			option.setName('mode')
				.setDescription('The bedwars mode.')
				.setRequired(true)
				.addChoices({
					name: 'Overall',
					value: 'overall'
				})
				.addChoices({
					name: 'Solos',
					value: 'solos'
				})
				.addChoices({
					name: 'Doubles',
					value: 'doubles'
				})
				.addChoices({
					name: 'Threes',
					value: 'threes'
				})
				.addChoices({
					name: 'Fours',
					value: 'fours'
				})
				.addChoices({
					name: '4v4',
					value: '4v4'
				}))
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('In game name of player.')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('winstreak')
				.setDescription('The winstreak number.')
				.setRequired(true)
		),
	async execute(interaction, client) {
		const ign = interaction.options.getString('ign');
		const winstreak = interaction.options.getInteger('winstreak');
		const playerResult = await request(`https://api.hypixel.net/player?key=${process.env.hypixelAPI}&name=${ign}`)
		const { success, player } = await getJSONResponse(playerResult.body)
		console.log(success)
		console.log(player.uuid)
		const uuid = player.uuid
		const mode = interaction.options.getString('mode')
		
	}
};