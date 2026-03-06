import leaderboard from "../../../schemas/skillless-bwldb.js";
import { EmbedBuilder, GuildMember } from "discord.js";
import type { ButtonInteraction, Client, Role } from "discord.js";
import axios from "axios";
import mongoose from "mongoose";
import config from "../../../config.js";
const botOwner = config.userIds.botOwner;
const leaderboardEditPermissionRoleName = config.bedwarsLeaderboard.roleName;

export default {
	data: {
		name: "refresh",
	},
	async execute(interaction: ButtonInteraction, _client: Client) {
		if (!interaction.member || !(interaction.member instanceof GuildMember))
			return;

		await interaction.reply({
			content: `<@${interaction.member.id}> Working..., dont refresh other ldbs till finished!`,
		});
		if (
			!(
				interaction.member.roles.cache.some(
					(role: Role) =>
						role.name === leaderboardEditPermissionRoleName
				) || String(interaction.member.id) == botOwner
			)
		) {
			await interaction.editReply({
				content: `<@${interaction.member.id}> You do not have permssion to do this.`,
			});
			return;
		}
		const mode = interaction.message.embeds[0].fields[0].name;
		const tempEmbed = new EmbedBuilder().setColor("#2C2F33");
		const players = await leaderboard.find({ mode: mode });
		if (players.length == 0) {
			await interaction.editReply({
				content: `<@${interaction.member.id}> There is no data for this mode stored.`,
			});
			return;
		}
		for (let i = 0; i < players.length; i++) {
			const uri = `https://api.mojang.com/user/profile/${players[i].uuid}`;
			const { data } = await axios.get<{ name: string }>(uri);
			const ign = data.name;
			await ldbAdd(ign, players[i].uuid, players[i].winstreak, mode);
		}
		for (let i = 0; i < players.length; i++) {
			for (let j = 0; j < players.length - i - 1; j++) {
				if (players[j].winstreak < players[j + 1].winstreak) {
					const temp = players[j];
					players[j] = players[j + 1];
					players[j + 1] = temp;
				}
			}
		}
		const total = players.length < 10 ? players.length : 10;
		let message = "";
		for (let i = 0; i < total; i++) {
			message = `${message}\n\`${i + 1}\`\u205F\u205F|\u205F\u205F**${players[i].ign}** - ${players[i].winstreak}`;
		}
		tempEmbed.addFields({ name: mode, value: message, inline: false });
		await interaction.message.edit({
			content: " ",
			embeds: [tempEmbed],
			components: interaction.message.components,
		});
		await interaction.editReply({
			content: `<@${interaction.member.id}> Finished!`,
		});
	},
};

async function ldbAdd(
	ign: string,
	uuid: string,
	winstreak: number,
	mode: string
) {
	let user = await leaderboard.findOne({ uuid: uuid, mode: mode });
	if (!user) {
		user = new leaderboard({
			_id: new mongoose.Types.ObjectId(),
			uuid: uuid,
			ign: ign,
			winstreak: winstreak,
			mode: mode,
		});
		await user.save().catch((err) => console.log(err));
	}
	await leaderboard.findOneAndUpdate(
		{ uuid: uuid, mode: mode },
		{ ign: ign, winstreak: winstreak }
	);
	return user;
}
