const interactionCommand = require("../../events/interactionCommand");

module.exports = {
	data: {
		name: 'success'
	},
	async execute (interaction, client) {
		interaction.deferUpdate();
		await interaction.message.edit({ content: 'Colour Success: #57F287'})
	}
}