const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pfp')
		.setDescription("Receive a user's profile picture.")
		.addUserOption(option => 
			option.setName('user')
				.setDescription('The user you want to get the profile picture of.')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const avatarUrl = user.displayAvatarURL();
		console.log(avatarUrl)
		await interaction.reply({content: avatarUrl, ephemeral: true }).catch(console.error);
	}
};