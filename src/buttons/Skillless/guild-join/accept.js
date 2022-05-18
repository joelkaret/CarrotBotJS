const { MessageEmbed } = require('discord.js');

module.exports = {
	data: {
		name: 'accept'
	},
	async execute (interaction, client) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Guild Staff')){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return
		};
		const userId = interaction.message.embeds[0].footer.text
		const member = interaction.client.users.cache.find(user => user.id === userId)
		await member.send('Your application into Skillless has been accepted!')
		await member.send('Please make sure you have left any current guild, and have guild invites turned on.')
		const tempEmbed = new MessageEmbed(interaction.message.embeds[0])
		const tempComponents = interaction.message.components
		tempComponents[0].components[0].setDisabled(true)
		tempEmbed.addFields(
			{ name: 'ACCEPTED', value: `By ${interaction.member}`}
		)
		await interaction.message.edit({ embeds: [tempEmbed], components: tempComponents, fetchReply: true })
		interaction.deferUpdate();
	}
}