const { SlashCommandBuilder } = require("@discordjs/builders");

const config = require("../../config.js");
const botOwner = config.userIds.botOwner;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("changenick")
		.setDescription("Change everyones nick to whatever you want")
		.addStringOption(option =>
			option.setName("nick")
				.setDescription("Nickname you want to change to.")
				.setRequired(true)
		),
	async execute(interaction, client) {
		await interaction.reply({ content: `${interaction.member} Working...`, ephemeral: true })
		if (String(interaction.member.id) !== botOwner) {
			await interaction.editReply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		const nick = interaction.options.getString("nick");
		const members = await interaction.guild.members.fetch()
		for (let user of members) {
			if (user[0] != botOwner) {
				console.log(await user[1].setNickname(nick))
			}
		}
		await interaction.editReply({ content: `${interaction.member} Finished`, ephemeral: true })
	},
};