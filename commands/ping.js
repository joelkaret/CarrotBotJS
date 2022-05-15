const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		return interaction.reply(`🏓Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
	},
};