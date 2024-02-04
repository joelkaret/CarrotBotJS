const leaderboard = require("../../../schemas/dino-ldb");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: {
		name: "refreshDino",
	},
	async execute(interaction, client) {
		await interaction.reply({
			content: `${interaction.member} Working...`,
			ephemeral: true,
		});
		const tempEmbed = new EmbedBuilder().setColor("#2C2F33");
		users = await leaderboard.find({});
		if (users.length == 0) {
			await interaction.editReply({
				content: `${interaction.member} There is no data for this mode stored.`,
				ephemeral: true,
			});
			return;
		}
		for (let i = 0; i < users.length; i++) { // Bubble Sort
			for (let j = 0; j < users.length - i - 1; j++) {
				if (users[j].score < users[j + 1].score) {
					let temp = users[j];
					users[j] = users[j + 1];
					users[j + 1] = temp;
				}
			}
		}
		let total = users.length < 30 ? users.length : 30;
		let message = "";
		for (let i = 0; i < total; i++) {
			let member = await interaction.message.guild.members.fetch(users[i].userId) || users[i].userid
			message = `${message}\n\`${i + 1}\`\u205F\u205F|\u205F\u205F**${
				member
			}** - ${users[i].score}`;
		}
        tempEmbed.addFields({ name: "Leaderboard", value: message, inline: false });
		await interaction.message.edit({
			content: " ",
			embeds: [tempEmbed],
			components: interaction.components,
			fetchReply: true,
		});
		await interaction.editReply({
			content: `${interaction.member} Finished!`,
			ephemeral: true,
		});
	},
};