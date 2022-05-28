module.exports = {
	data: {
		name: 'play'
	},
	async execute (interaction, client) {
		interaction.deferUpdate();
		const tempComponents = interaction.message.components
		tempComponents[0].components[0].setDisabled(true)
		await interaction.message.edit({ embeds: [tempEmbed], components: tempComponents, fetchReply: true })
		await interaction.message.edit({ content: 'Colour Danger: #ED4245', })
	}
}