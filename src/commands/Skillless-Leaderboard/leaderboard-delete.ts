// import { request } from "undici";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, Client, Role } from "discord.js";
import { GuildMember } from "discord.js";
import "dotenv/config";
import axios from "axios";
import leaderboard from "../../schemas/skillless-bwldb";
import config from "../../config";
import type { MojangProfileResponse } from "../../types/bot.js";
const leaderboardEditPermissionRoleName = config.bedwarsLeaderboard.roleName;
const botOwner = config.userIds.botOwner;

export default {
	data: new SlashCommandBuilder()
		.setName("leaderboard-delete")
		.setDescription("Remove a user from the leaderboard.")
		.addStringOption((option) =>
			option
				.setName("mode")
				.setDescription("The bedwars mode.")
				.setRequired(true)
				.addChoices({
					name: "Overall",
					value: "Overall",
				})
				.addChoices({
					name: "Solos",
					value: "Solos",
				})
				.addChoices({
					name: "Doubles",
					value: "Doubles",
				})
				.addChoices({
					name: "Threes",
					value: "Threes",
				})
				.addChoices({
					name: "Fours",
					value: "Fours",
				})
				.addChoices({
					name: "4v4",
					value: "4v4",
				})
		)
		.addStringOption((option) =>
			option
				.setName("ign")
				.setDescription("In game name of player.")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		if (!interaction.member || !(interaction.member instanceof GuildMember))
			return;
		if (
			!(
				interaction.member.roles.cache.some(
					(role: Role) =>
						role.name === leaderboardEditPermissionRoleName
				) || String(interaction.member.id) === botOwner
			)
		) {
			await interaction.reply({
				content: `${interaction.member.toString()} You do not have permssion to do this.`,
				ephemeral: true,
			});
			return;
		}
		const ign = interaction.options.getString("ign");
		const mode = interaction.options.getString("mode");
		const uri = `https://api.mojang.com/users/profiles/minecraft/${ign}?`;
		const response = await axios.get<MojangProfileResponse>(uri);
		const uuid = response.data.id;
		await leaderboard.deleteOne({ uuid: uuid, mode: mode });
		await interaction.reply("um");
	},
};
