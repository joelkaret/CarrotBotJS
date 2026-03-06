import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, Client } from "discord.js";
import { GuildMember } from "discord.js";

import config from "../../config.js";
const botOwner = config.userIds.botOwner;

export default {
	data: new SlashCommandBuilder()
		.setName("changenick")
		.setDescription("Change everyones nick to whatever you want")
		.addStringOption((option) =>
			option
				.setName("nick")
				.setDescription("Nickname you want to change to.")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		await interaction.reply({
			content: `${interaction.user.toString()} Working...`,
			ephemeral: true,
		});
		if (!interaction.member || !(interaction.member instanceof GuildMember))
			return;
		if (String(interaction.member.id) !== botOwner) {
			await interaction.editReply({
				content: `${interaction.member.toString()} You do not have permssion to do this.`,
			});
			return;
		}
		const nick = interaction.options.getString("nick");
		if (!interaction.guild) return;
		const members = await interaction.guild.members.fetch();
		for (const user of members) {
			if (user[0] != botOwner) {
				console.log(await user[1].setNickname(nick));
			}
		}
		await interaction.editReply({
			content: `${interaction.member.toString()} Finished`,
		});
	},
};
