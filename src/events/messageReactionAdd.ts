import "dotenv/config";
import fs from "node:fs";
import type {
	MessageReaction,
	User,
	Client,
	PartialMessageReaction,
} from "discord.js";
import type { PaintballData } from "../types/bot.js";

const clientId = process.env.clientId;
import config from "../config";
const paintballRoleName = config.paintball.roleName;
const paintballReactionEmoji = config.paintball.reactionEmoji;
const paintballDataFile = config.paintball.fileName;

export default {
	name: "messageReactionAdd",
	once: false,
	async execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User,
		_client: Client
	) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(
					"Something went wrong when fetching the message:",
					error
				);
				return;
			}
		}

		if (!reaction.message.guild) return;

		const member = reaction.message.guild.members.cache.get(user.id);
		if (user.id == clientId) return;

		// Paintball Player Count Role Assignment:
		let paintballData: Partial<PaintballData> = {};
		try {
			paintballData = JSON.parse(
				fs.readFileSync(paintballDataFile, {
					encoding: "utf8",
					flag: "r",
				})
			) as Partial<PaintballData>;
		} catch (error) {
			console.error("Error reading file: ", error);
			paintballData = {
				lastCount: -1,
				lastMessageId: "",
				lastTimeSeenAbove: "Never",
				lastPingTime: "Never",
				maxCount: 0,
			};
		}
		if (
			reaction.message.id ===
				paintballData.lastPaintballPlayerMessageId &&
			reaction.emoji.toString() === paintballReactionEmoji
		) {
			let role = reaction.message.guild.roles.cache.find(
				(r) => r.name === paintballRoleName
			);
			if (!role) {
				try {
					role = await reaction.message.guild.roles.create({
						name: paintballRoleName,
						mentionable: true,
						reason: "Needed for Paintball Pings",
					});
				} catch (err) {
					console.error("Failed to create role:", err);
					return;
				}
			}
			if (!member) return;
			try {
				await member.roles.add(role);
			} catch (err) {
				console.error("Failed to assign role:", err);
			}
		}
	},
};
