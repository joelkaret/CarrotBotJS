const { SlashCommandBuilder } = require("@discordjs/builders");

const config = require("../../config.js");
const botOwner = config.userIds.botOwner;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Make the bot leave the server"),
	async execute(interaction, client) {
		if (!String(interaction.member.id) == botOwner) {
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		interaction.guild.leave()
	},
};