module.exports = {
	data: {
		name: 'quit'
	},
	async execute (interaction, client) {
		interaction.deferUpdate();
		await interaction.message.edit({ content: 'Colour Danger: #ED4245'})
	}
}