const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: {
		name: 'accept'
	},
	async execute (interaction, client) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Guild Staff') && String(interaction.member.id) != "506884005195677696"){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return
		};
		const userId = interaction.message.embeds[0].footer.text.toString()
		const member = await interaction.client.users.fetch(userId)
		console.log(member)
		await member.send('Your application into Skillless has been accepted!')
			.catch(() => console.log(`${member} has dm's off`));
		await member.send('Please make sure you have left any current guild, and have guild invites turned on.')
			.catch(() => interaction.reply({ content: `${member} does not have direct messages turned on. Please let them know that you have accepted this manually.`, ephemeral: true }));
		const tempEmbed = new EmbedBuilder(interaction.message.embeds[0])
		const tempComponents = interaction.message.components
		tempComponents[0].components[0].setDisabled(true)
		tempEmbed.addFields(
			{ name: 'ACCEPTED', value: `By ${interaction.member}`}
		)
		await interaction.message.edit({ embeds: [tempEmbed], components: tempComponents, fetchReply: true })
		interaction.deferUpdate();
	}
}