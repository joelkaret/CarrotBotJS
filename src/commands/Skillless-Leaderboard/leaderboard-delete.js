// const { request } = require('undici');
const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const axios = require('axios')
const leaderboard = require('../../schemas/skillless-bwldb')
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard-delete')
		.setDescription("Remove a user from the leaderboard.")
		.addStringOption(option => 
			option.setName('mode')
				.setDescription('The bedwars mode.')
				.setRequired(true)
				.addChoices({
					name: 'Overall',
					value: 'Overall'
				})
				.addChoices({
					name: 'Solos',
					value: 'Solos'
				})
				.addChoices({
					name: 'Doubles',
					value: 'Doubles'
				})
				.addChoices({
					name: 'Threes',
					value: 'Threes'
				})
				.addChoices({
					name: 'Fours',
					value: 'Fours'
				})
				.addChoices({
					name: '4v4',
					value: '4v4'
				}))
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('In game name of player.')
				.setRequired(true)
		),
	async execute(interaction, client) {
		if (!(interaction.member.roles.cache.some(role => role.name === 'Guild Staff') || String(interaction.member.id) == "506884005195677696")){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		const ign = interaction.options.getString('ign');
		const mode = interaction.options.getString('mode');
		// `https://api.hypixel.net/player?key=${process.env.hypixelAPI}&name=${ign}`
		const uri = `https://api.mojang.com/users/profiles/minecraft/${ign}?`
		const { data } = await axios.get(uri)
		// https://api.mojang.com/user/profiles/{uuid}/names
		// const uuid = await getJSONResponse(response.body) // success is if successful. player is the data.
		const uuid = data.id
        await leaderboard.deleteOne({ uuid: uuid, mode: mode });
		await interaction.reply("um")
	}
};