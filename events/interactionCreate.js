const { CommandInteraction } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`)
		// const command = client.commands.get(interaction.commandName);
	},
	
};