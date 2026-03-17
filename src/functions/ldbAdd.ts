import leaderboard from "../schemas/skillless-bwldb";
import mongoose from "mongoose";
import type { Client } from "discord.js";
import log from "../utils/logger";

export default (client: Client) => {
	client.ldbAdd = async (
		ign: string,
		uuid: string,
		winstreak: number,
		mode: string
	): Promise<void> => {
		let user = await leaderboard.findOne({ uuid: uuid, mode: mode });
		if (!user) {
			user = new leaderboard({
				_id: new mongoose.Types.ObjectId(),
				uuid: uuid,
				ign: ign,
				winstreak: winstreak,
				mode: mode,
			});
			await user
				.save()
				.catch((err) =>
					log.error("Failed to save leaderboard user:", err)
				);
			await leaderboard.findOneAndUpdate(
				{ uuid: uuid, mode: mode },
				{ ign: ign, winstreak: winstreak }
			);
		}
	};
};
