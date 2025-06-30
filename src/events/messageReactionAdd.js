require("dotenv").config();
const fs = require("node:fs");

const clientId = process.env.clientId;
const leaderboard = require("../schemas/dino-ldb");
const mongoose = require("mongoose");
const { cyanBright, gray } = require("colorette");
const paintballRoleName = "Paintball"

module.exports = {
	name: "messageReactionAdd",
	once: false,
	async execute(reaction, user, client) {
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

		const member = reaction.message.guild.members.cache.get(user.id);
		if (user.id == clientId) return;

		// Chiming Clock Game:
		const lastDinoId = fs.readFileSync("src/lastDino.txt", {
			encoding: "utf8",
			flag: "r",
		});
		if (reaction.message.id === lastDinoId) {
			let dinoReacted = fs.readFileSync("src/dinoReacted.txt", {
				encoding: "utf8",
				flag: "r",
			});
			if (dinoReacted === "false") {
				dinoReacted = false;
			} else if (dinoReacted === "true") {
				dinoReacted = true;
			} else {
				console.log(
					`[${cyanBright("DEBUG")}] ${gray(
						"dinoReacted.txt was neither true nor false."
					)}`
				);
			}

			if (!dinoReacted) {
				if (reaction.emoji.toString() == "🦖") {
					fs.writeFile("src/dinoReacted.txt", "true", (err) => {
						if (err) throw err;
					});
					await dinoAdd(user.id);
					await reaction.message.edit(`${reaction.message.content} - ${member}`)
				}
			}
		}

		const paintballDataFile = "src/paintballPlayerCountsData.json";
		let paintballData = {};
		try {
			paintballData = JSON.parse(
				fs.readFileSync(paintballDataFile, {
					encoding: "utf8",
					flag: "r",
				})
			);
		} catch (error) {
			console.error("Error reading file: ", error);
			paintballData = {
				lastPaintballPlayerCount: -1,
				lastPaintballPlayerMessageId: "",
				lastTimeSeenPb: "Never",
				lastTimePinged: "Never",
				maxPbPlayerCount: 0,
			};
		}
		if (reaction.message.id == paintballData.lastPaintballPlayerMessageId) {
			if (reaction.emoji.toString() == "⚪") {
				const role = reaction.message.guild.roles.cache.find((r) => r.name === paintballRoleName)
				member.roles.add(role)
			}
		}

		if (reaction.message.channelId != "918550313693245470") return;
		let emojiList = [
			client.emojis.cache.find((emoji) => emoji.name === "agree"),
			client.emojis.cache.find((emoji) => emoji.name === "disagree"),
		];
		if (!(emojiList.indexOf(reaction.emoji) >= 0)) {
			reaction.users.remove(user);
			return;
		}
		if (
			!(
				member.roles.cache.some(
					(role) => role.id === "759257487605366795"
				) ||
				member.roles.cache.some((role) => role.name === "Guild Staff")
			)
		) {
			reaction.users.remove(user);
			return;
		}
	},
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
