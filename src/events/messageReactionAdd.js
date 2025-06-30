require("dotenv").config();
const fs = require("node:fs");

const clientId = process.env.clientId;
const leaderboard = require("../schemas/dino-ldb");
const mongoose = require("mongoose");
const { cyanBright, gray } = require("colorette");
const config = require("../config.js");
const paintballRoleName = config.paintball.roleName;
const paintballReactionEmoji = config.paintball.reactionEmoji;
const chimingClockEmoji = config.chimingClock.emoji;
const paintballDataFile = config.paintball.fileName;
const chimingClockLastMessageIdFile = config.chimingClock.lastMessageIdFile;
const chimingClockReactedFile = config.chimingClock.reactedFile;

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
		const lastDinoId = fs.readFileSync(chimingClockLastMessageIdFile, {
			encoding: "utf8",
			flag: "r",
		});
		if (reaction.message.id === lastDinoId) {
			let dinoReacted = fs.readFileSync(chimingClockReactedFile, {
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
				if (reaction.emoji.toString() == chimingClockEmoji) {
					fs.writeFile("src/dinoReacted.txt", "true", (err) => {
						if (err) throw err;
					});
					await dinoAdd(user.id);
					await reaction.message.edit(`${reaction.message.content} - ${member}`)
				}
			}
		}

		// Paintball Player Count Role Assignment:
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
		if (reaction.message.id === paintballData.lastPaintballPlayerMessageId && reaction.emoji.toString() === paintballReactionEmoji) {
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
			try {
				await member.roles.add(role);
			} catch (err) {
				console.error("Failed to assign role:", err);
			}
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
