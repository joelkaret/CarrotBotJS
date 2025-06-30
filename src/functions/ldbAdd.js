const leaderboard = require("../schemas/skillless-bwldb");
const mongoose = require("mongoose");

module.exports = (client) => {
	client.ldbAdd = async (ign, uuid, winstreak, mode) => {
		let user = await leaderboard.findOne({ uuid: uuid, mode: mode })
		if (!user) {
			user = await new leaderboard({
				_id: mongoose.Types.ObjectId(),
				uuid: uuid,
				ign: ign,
				winstreak: winstreak,
				mode: mode,
			});
			await leaderboard.save().catch(err => console.log(err));
			await leaderboard.findOneAndUpdate({ uuid: uuid, mode: mode }, { ign: ign, winstreak: winstreak });
			return user;
		};
	};
};