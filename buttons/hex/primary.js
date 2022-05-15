const interactionCommand = require("../../events/interactionCommand");

module.exports = {
	data: {
		name: 'primary'
	},
	async execute (interaction, client) {
		interaction.deferUpdate();
		await interaction.message.edit({ content: 'Colour Primary: #5865F2'})
	}
}