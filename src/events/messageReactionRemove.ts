import "dotenv/config";
import fs from "node:fs";
import type {
	MessageReaction,
	User,
	Client,
	PartialMessageReaction,
} from "discord.js";
import type { PaintballData } from "../types/bot";
import log from "../utils/logger";

const clientId = process.env.clientId;
import config from "../config";
const paintballRoleName = config.paintball.roleName;
const paintballReactionEmoji = config.paintball.reactionEmoji;
const paintballDataFile = config.paintball.fileName;

export default {
	name: "messageReactionRemove",
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
				log.error(
					"Something went wrong when fetching the message:",
					error
				);
				return;
			}
		}

		if (!reaction.message.guild) return;

		const member = reaction.message.guild.members.cache.get(user.id);
		if (user.id == clientId) return;

		let paintballData: Partial<PaintballData> = {};
		try {
			paintballData = JSON.parse(
				fs.readFileSync(paintballDataFile, {
					encoding: "utf8",
					flag: "r",
				})
			) as Partial<PaintballData>;
		} catch (error) {
			log.error("Error reading file:", error);
			paintballData = {
				lastCount: -1,
				lastMessageId: "",
				lastTimeSeenAbove: "Never",
				lastPingTime: "Never",
				maxCount: 0,
			};
		}
		if (reaction.message.id == paintballData.lastPaintballPlayerMessageId) {
			if (reaction.emoji.toString() == paintballReactionEmoji) {
				const role = reaction.message.guild.roles.cache.find(
					(r) => r.name === paintballRoleName
				);
				if (!member || !role) return;
				void member.roles.remove(role);
			}
		}
	},
};
