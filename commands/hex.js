const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionResponseType } = require('discord-api-types/v10');
const {MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hex')
		.setDescription('Dispplays hex colour codes for Discord buttons.'),
	async execute(interaction, client) {
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('primary')
				.setLabel('Primary')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('success')
				.setLabel('Success')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('danger')
				.setLabel('Danger')
				.setStyle('DANGER'),
		);
		await interaction.reply({ content: 'Click buttons to get their hex colour code:', components: [row] });
	},
};