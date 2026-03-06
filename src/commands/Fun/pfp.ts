import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("pfp")
		.setDescription("Receive a user's profile picture.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"The user you want to get the profile picture of."
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("display")
				.setDescription("How would you like this displayed.")
				.setRequired(false)
				.addChoices({
					name: "Image",
					value: "image",
				})
				.addChoices({
					name: "Embed",
					value: "embed",
				})
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("user");
		if (!user) return;
		const avatarUrl = user.displayAvatarURL();

		if (interaction.options.getString("display") == "embed") {
			const embed = new EmbedBuilder()
				.setColor("#0099ff")
				.setImage(avatarUrl);
			await interaction.reply({ embeds: [embed] });
		} else {
			await interaction
				.reply({ content: avatarUrl, ephemeral: false })
				.catch(console.error);
		}
	},
};
