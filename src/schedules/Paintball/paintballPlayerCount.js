const {
	ToadScheduler,
	SimpleIntervalJob,
	AsyncTask,
} = require("toad-scheduler");
const fs = require("node:fs");
const axios = require("axios");
const { time, TimestampStyles, roleMention, EmbedBuilder } = require("discord.js");
const guildId = "1288293666531577988";
const channelId = "1297000322853765210";
const hypixelApiKey = process.env.hypixelApiKey;
const roleName = "Paintball"
const numToAlert = 12;

module.exports = (client) => {
	const scheduler = new ToadScheduler();
	const task = new AsyncTask("paintballCounts", async () => {
		try {
			const uri = `https://api.hypixel.net/v2/counts?key=${hypixelApiKey}`;
			const result = await axios.get(uri);

			const guild = await client.guilds.cache.get(guildId);
			const channel = await guild.channels.cache.find(
				(C) => C.id == channelId
			);
			const role = guild.roles.cache.find((r) => r.name === roleName)
			const rolePing = role ? roleMention(role.id) : "No role, Please make one called 'Paintball'"

			const data = result.data;
			const games = data.games;
			const legacy = games.LEGACY;
			const legacyModes = legacy.modes;
			const paintball = Number(legacyModes.PAINTBALL);

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

			const lastPaintballPlayerCount = Number(
				paintballData.lastPaintballPlayerCount
			);
			const lastPaintballPlayerMessageId =
				paintballData.lastPaintballPlayerMessageId;
			const lastTimeSeenPb = paintballData.lastTimeSeenPb;
			const maxPbPlayerCount = Number(paintballData.maxPbPlayerCount);
			let timeSinceLastPing = paintballData.lastTimePinged;
			if (paintball === lastPaintballPlayerCount) return;

			const pbDifference = paintball - lastPaintballPlayerCount;
			const pbDifferenceString =
				pbDifference > 0
					? `+ ${pbDifference}`
					: `\\-${pbDifference * -1}`;

			paintballData.lastPaintballPlayerCount = paintball;
			const info = `Info: Will ghost ping ${rolePing}
            whenever there are ${numToAlert} players. 
            Won't ping if already pinged within last 30 minutes.
            React with :white_circle: to receive the role.
            Remove reaction to remove role.`;

			const timeNow = new Date();
			const relativeSinceNow = time(
				timeNow,
				TimestampStyles.RelativeTime
			);
			const lastTimePinged =
				timeSinceLastPing === "Never"
					? "Never"
					: new Date(timeSinceLastPing);
			const relativeSincePinged =
				lastTimePinged === "Never"
					? "Never"
					: time(lastTimePinged, TimestampStyles.RelativeTime);

			if (channel) {
				const embed = new EmbedBuilder()
					.setColor("#cfc2ff")
					.addFields({
						name: "Paintball player count:",
						value: `${paintball} (${pbDifferenceString}) \n Since: ${relativeSinceNow}`,
						inline: false,
					})
					.setTimestamp();

				if (paintball >= numToAlert) {
					embed.addFields({
						name: `Last time player count was above ${numToAlert}:`,
						value: relativeSinceNow,
						inline: false,
					});

					paintballData.lastTimeSeenPb = relativeSinceNow;
					if (
						lastTimePinged === "Never" ||
						timeNow.getTime() - lastTimePinged.getTime() > 1000 * 60 * 30
					) {
						paintballData.lastTimePinged = timeNow;
						const ghostPing = await channel.send(rolePing);
						await ghostPing.delete();
						embed.addFields({
							name: "Last ping:",
							value: relativeSinceNow,
							inline: false,
						});
					} else {
						embed.addFields({
							name: "Last ping:",
							value: relativeSincePinged,
							inline: false,
						});
					}
				} else {
					embed.addFields({
						name: `Last time player count was above ${numToAlert}:`,
						value: lastTimeSeenPb,
						inline: false,
					});
					embed.addFields({
						name: "Last ping:",
						value: relativeSincePinged,
						inline: false,
					});
				}

				if (paintball > maxPbPlayerCount) {
					embed.addFields({
						name: "Max player count seen:",
						value: String(paintball),
						inline: false,
					});

					paintballData.maxPbPlayerCount = paintball;
				} else {
					embed.addFields({
						name: "Max player count seen:",
						value: String(maxPbPlayerCount),
						inline: false,
					});
				}
				let reactionEmoji = "⚪";
				try {
					const message = await channel.messages.fetch(
						lastPaintballPlayerMessageId
					);
					await message.edit({ embeds: [embed], content: info });
					message.react(reactionEmoji);
				} catch (error) {
					console.error("Error editing message: ", error);
					const newMessage = await channel.send({
						embeds: [embed],
						content: info,
					});
					paintballData.lastPaintballPlayerMessageId = newMessage.id;
					newMessage.react(reactionEmoji);
				}
			}

			fs.writeFileSync(
				paintballDataFile,
				JSON.stringify(paintballData),
				(err) => {
					if (err) throw err;
				}
			);
		} catch (error) {
			console.error(
				"Error fetching data or processing paintball counts: ",
				error
			);
		}
	});

	const job = new SimpleIntervalJob({ seconds: 10 }, task);
	scheduler.addSimpleIntervalJob(job);
};
