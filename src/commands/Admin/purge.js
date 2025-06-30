const { SlashCommandBuilder } = require("@discordjs/builders");
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription("Purge messages in a channel")
		.addIntegerOption((option) =>
			option
				.setName("number")
				.setDescription("Number of messages to purge.")
				.setRequired(true)
		),
	async execute(interaction, client) {
		if (interaction.user.id !== "506884005195677696") {
			await interaction.reply({
				content: `${interaction.member} You do not have permssion to do this.`,
				ephemeral: true,
			});
			return;
		}
		const number = interaction.options.getInteger("number");
		await interaction.channel.bulkDelete(number);
		await interaction.reply({
			content: `Deleted ${number} messages`,
			ephemeral: true,
		});
	},
};
