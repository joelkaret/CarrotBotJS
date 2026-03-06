import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, Client } from "discord.js";
import { GuildMember } from "discord.js";

import config from "../../config.js";
const botOwner = config.userIds.botOwner;

export default {
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Make the bot leave the server"),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		if (!interaction.member || !(interaction.member instanceof GuildMember))
			return;
		if (String(interaction.member.id) !== botOwner) {
			await interaction.reply({
				content: `${interaction.member.toString()} You do not have permssion to do this.`,
				ephemeral: true,
			});
			return;
		}
		if (!interaction.guild) return;
		void interaction.guild.leave();
	},
};
