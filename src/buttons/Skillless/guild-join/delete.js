module.exports = {
	data: {
		name: 'delete'
	},
	async execute (interaction, client) {
		const userId = interaction.message.embeds[0].footer.text
		const member = interaction.client.users.cache.find(user => user.id === userId)
		if (!(interaction.member.roles.cache.some(role => role.name === 'Guild Staff') || interaction.member.user === member)){
			// If the user is not a guild staff or is not the application owner.
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return
		};
		await interaction.message.delete();
	}
}