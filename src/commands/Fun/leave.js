const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Make the bot leave the server'),
	async execute(interaction, client) {
		if (!String(interaction.member.id) == "506884005195677696"){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		interaction.guild.leave()
	},
};