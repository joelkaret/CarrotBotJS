// const { request } = require('undici');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();
const axios = require('axios')
const leaderboard = require('../../schemas/skillless-bwldb')
const mongoose = require('mongoose');

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
		)
		.addIntegerOption(option =>
			option.setName('winstreak')
				.setDescription('The winstreak number.')
				.setRequired(true)
		),
	async execute(interaction, client) {
		if (!(interaction.member.roles.cache.some(role => role.name === 'Guild Staff') || String(interaction.member.id) == "506884005195677696")){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		const ign = interaction.options.getString('ign');
		const winstreak = interaction.options.getInteger('winstreak');
		const mode = interaction.options.getString('mode');
		// `https://api.hypixel.net/player?key=${process.env.hypixelAPI}&name=${ign}`
		const uri = `https://api.mojang.com/users/profiles/minecraft/${ign}?`;
		
		// https://api.mojang.com/user/profiles/{uuid}/names
		// const uuid = await getJSONResponse(response.body) // success is if successful. player is the data.
		try {
			const { data } = await axios.get(uri);
		} catch (error) {
			await interaction.reply(`\`${ign}\` is an invalid ign.`);
			return;
		}
		const uuid = data.id;
		if (uuid == null) {
			await interaction.reply(`The ign \`${ign}\` does not exist!`);
			return;
		}
		const leaderboard = await ldbAdd(ign, uuid, winstreak, mode);
		await interaction.reply(`${ign} added to ${mode} leaderboard! Refresh leaderboard to see changes!`);
	}
};
 
async function ldbAdd(ign, uuid, winstreak, mode) {
	let user = await leaderboard.findOne({ uuid: uuid, mode: mode })
	if (!user) {
		user = await new leaderboard({
			_id: mongoose.Types.ObjectId(),
			uuid: uuid,
			ign: ign,
			winstreak: winstreak,
			mode: mode,
		});
		await user.save().catch(err => console.log(err));
	};
	await leaderboard.findOneAndUpdate({ uuid: uuid, mode: mode }, { ign: ign, winstreak: winstreak });
	return user;
};