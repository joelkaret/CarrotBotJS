const {
	ToadScheduler,
	SimpleIntervalJob,
	AsyncTask,
} = require("toad-scheduler");
const fs = require("node:fs");
const axios = require("axios");
const { time, TimestampStyles, roleMention, EmbedBuilder } = require("discord.js");

const config = require("../../config.js");
const guildId = config.paintball.guildId;
const channelId = config.paintball.channelId;
const hypixelApiKey = process.env.hypixelApiKey;
const roleName = config.paintball.roleName || "Paintball";
const numToAlert = config.paintball.numToAlert || 12;
const minutesBetweenAlerts = config.paintball.minutesBetweenAlerts || 30
const timeBetweenAlertsMs = minutesBetweenAlerts * 60 * 1000;

module.exports = (client) => {
	const messageIdFile = "src/paintballMessageId.json";
	let paintballData = {
		lastCount: -1,
		lastMessageId: "",
		lastTimeSeenAbove: "Never",
		lastPingTime: "Never",
		maxCount: 0,
	};

	try {
		const raw = fs.readFileSync(messageIdFile, { encoding: "utf8", flag: "r" });
		if (raw && raw.trim()) {
			const parsed = JSON.parse(raw);
			paintballData.lastMessageId = parsed.lastPaintballPlayerMessageId || "";
		}
	} catch (_) {
		// If file missing or invalid, ignore; we'll create a new message
	}

	const scheduler = new ToadScheduler();
	const task = new AsyncTask("paintballCounts", async () => {
		try {
			const uri = `https://api.hypixel.net/v2/counts?key=${hypixelApiKey}`;
			const result = await axios.get(uri);

			const guild = await client.guilds.cache.get(guildId);
			const channel = await guild.channels.cache.find(
				(C) => C.id == channelId
			);
			let role = guild.roles.cache.find(r => r.name === roleName);
			if (!role) {
				try {
					role = await guild.roles.create({
						name: roleName,
						mentionable: true,
						reason: `Auto-created role '${roleName}'`
					});
				} catch (error) {
					console.error(`Failed to create role '${roleName}':`, error);
				}
			}
			const rolePing = role ? roleMention(role.id) : "No role, and failed to create. Please make one called 'Paintball'"
			const data = result.data;
			const games = data.games;
			const legacy = games.LEGACY;
			const legacyModes = legacy.modes;
			const paintball = Number(legacyModes.PAINTBALL);

			const lastPaintballPlayerCount = Number(paintballData.lastCount);
			const lastPaintballPlayerMessageId = paintballData.lastMessageId;
			const lastTimeSeenPb = paintballData.lastTimeSeenAbove;
			const maxPbPlayerCount = Number(paintballData.maxCount);
			let timeSinceLastPing = paintballData.lastPingTime;
			if (paintball === lastPaintballPlayerCount) return;

			const pbDifference = paintball - lastPaintballPlayerCount;
			const pbDifferenceString =
				pbDifference > 0
					? `+ ${pbDifference}`
					: `\\-${pbDifference * -1}`;

			paintballData.lastCount = paintball;
			const info = `Info: Will ghost ping ${rolePing}
            whenever there are ${numToAlert} players. 
            Won't ping if already pinged within last ${minutesBetweenAlerts} minutes.
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

					paintballData.lastTimeSeenAbove = relativeSinceNow;
					if (
						lastTimePinged === "Never" ||
						timeNow.getTime() - lastTimePinged.getTime() > timeBetweenAlertsMs
					) {
						paintballData.lastPingTime = timeNow;
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

					paintballData.maxCount = paintball;
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
					paintballData.lastMessageId = newMessage.id;
					try {
						fs.writeFileSync(
							messageIdFile,
							JSON.stringify({ lastPaintballPlayerMessageId: paintballData.lastMessageId })
						);
					} catch (e) {
						console.error("Failed to persist paintball message id:", e);
					}
					newMessage.react(reactionEmoji);
				}
			}

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
