const schedule = require("node-schedule");
const fs = require("node:fs");
const { cyanBright, gray } = require("colorette");

const leaderboard = require("../schemas/dino-ldb");
const mongoose = require("mongoose");

const clientId = process.env.clientId;
const carrotClubId = "835942211635773472";
const channelId = "835963832718590023";
const rule = new schedule.RecurrenceRule();
rule.minute = 0;

module.exports = (client) => {
	schedule.scheduleJob(rule, async function () {
		const carrotClub = client.guilds.cache.get(carrotClubId);
		let channel = carrotClub.channels.cache.find((C) => C.id == channelId);
		if (channel) {
			let dinoReacted = fs.readFileSync("src/dinoReacted.txt", {
				encoding: "utf8",
				flag: "r",
			});
			const lastDinoId = fs.readFileSync("src/lastDino.txt", {
				encoding: "utf8",
				flag: "r",
			});
			if (dinoReacted === "false" && lastDinoId !== "") {
				// let dinoEmoji = client.emojis.cache.find(emoji => emoji.name === "t_rex"); //🦖
				const lastDinoMessage = await channel.messages.fetch(
					lastDinoId
				);
				if (!lastDinoMessage) {
					console.log(
						`[${cyanBright("DEBUG")}] ${gray(
							"dinoReacted was false, and bot failed to react."
						)}
						Last Dino Message ID: ${lastDinoId}
						Last Dino Message: ${lastDinoMessage}`
					);
				}
				try {
					await lastDinoMessage.react("🦖");
					await lastDinoMessage.edit(
						`${lastDinoMessage.content} - Carrot Bot Rules all.`
					);
					await dinoAdd(clientId);
				} catch (err) {
					console.error(err);
				}
			}

			const message = await channel.send("Ding Dong!");
			fs.writeFile("src/lastDino.txt", `${message.id}`, (err) => {
				if (err) throw err;
			});
			fs.writeFile("src/dinoReacted.txt", "false", (err) => {
				if (err) throw err;
			});
		}
	});
};

async function dinoAdd(userId) {
	let user = await leaderboard.findOne({ userId: userId });
	if (!user) {
		user = await new leaderboard({
			_id: new mongoose.Types.ObjectId(),
			userId: userId,
			score: 0,
		});
		await user.save().catch((err) => console.log(err));
	}

	await leaderboard.findOneAndUpdate(
		{ userId: userId },
		{ score: user.score + 1 }
	);
	return user;
}
