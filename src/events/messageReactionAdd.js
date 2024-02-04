require("dotenv").config();
const fs = require("node:fs");

const clientId = process.env.clientId;
const leaderboard = require("../schemas/dino-ldb");
const mongoose = require("mongoose");
const { cyanBright, gray } = require("colorette");

module.exports = {
	name: "messageReactionAdd",
	once: false,
	async execute(reaction, user, client) {
		if (reaction.partial) {
			// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(
					"Something went wrong when fetching the message:",
					error
				);
				// Return as `reaction.message.author` may be undefined/null
				return;
			}
		}

		const member = reaction.message.guild.members.cache.get(user.id);
		if (user.id == clientId) return;

		// "lastDino.txt"
		// "dinoReacted.txt"

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
					await dinoAdd(reaction.user.id);
				}
			}
		}

		if (
			reaction.emoji.toString() == "🪥" &&
			String(member.id) == "506884005195677696"
		) {
			reaction.message.delete();
			return;
		}
		// if (reaction.emoji.toString() == '💼' && String(member.id) == "506884005195677696") {
		// 	const role = await reaction.message.guild.roles.cache.find(role => role.name === "Public Members");
		// 	const userId = reaction.message.author.id
		// 	const member = await reaction.message.guild.members.fetch(userId)
		// 	member.roles.add(role)
		// 	return;
		// };
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
			score: 1,
		});
		await user.save().catch((err) => console.log(err));
	}

	await leaderboard.findOneAndUpdate(
		{ userId: userId },
		{ score: user.score + 1 }
	);
	return user;
}
