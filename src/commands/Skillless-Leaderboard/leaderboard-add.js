const { request } = require('undici');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();
// const x = require('../../functions/dbLogin.js');
const Sequelize = require('sequelize');

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}
	return JSON.parse(fullBody);
}

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
})

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
		let db
		if (mode == 'overall') db = 'skillless-bwldb-overall'
		if (mode == 'solos') db = 'skillless-bwldb-solos'
		if (mode == 'doubles') db = 'skillless-bwldb-doubles'
		if (mode == 'threes') db = 'skillless-bwldb-threes'
		if (mode == 'fours') db = 'skillless-bwldb-fours'
		if (mode == '4v4') db = 'skillless-bwldb-4v4s'
		const ldb = sequelize.define(db, {
			ign: { type: Sequelize.STRING, unique: true },
			uuid: { type: Sequelize.STRING, unique: true },
			winstreak: Sequelize.INTEGER,
		});
		try {
			// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
			const entry = await ldb.create({
				ign: ign,
				uuid: uuid,
				winstreak: winstreak,
			});

			return interaction.reply(`Tag ${entry.ign} added.`);
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That ign already exists.');
			}
			console.error(error)
			return interaction.reply('Something went wrong with adding a ign.');
		}


	}
};