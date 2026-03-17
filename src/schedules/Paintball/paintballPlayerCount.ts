import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import fs from "node:fs";
import axios from "axios";
import {
	time,
	TimestampStyles,
	roleMention,
	EmbedBuilder,
	Client,
	TextChannel,
} from "discord.js";

import config from "../../config";
import type { HypixelCountsResponse, PaintballData } from "../../types/bot";

const guildId = config.paintball.guildId;
const channelId = config.paintball.channelId;
const hypixelApiKey = process.env.hypixelApiKey;
const roleName = config.paintball.roleName || "Paintball";
const numToAlert = config.paintball.numToAlert || 12;
const minutesBetweenAlerts = config.paintball.minutesBetweenAlerts || 30;
const timeBetweenAlertsMs = minutesBetweenAlerts * 60 * 1000;

const NOT_YET_FETCHED = -1;
const API_UNAVAILABLE = -2;

export default (client: Client) => {
	const messageIdFile = config.paintball.fileName;
	// Paintball data stored in memory - only lastMessageId is persisted to disk.
	// Other stats (lastCount, lastTimeSeenAbove, etc.) are intentionally ephemeral
	// to avoid expensive file writes every 10 seconds. Message ID only needs to be
	// written once when a new message is created.
	const paintballData: {
		lastCount: number; // -1 = not yet fetched, -2 = API unavailable, >=0 = actual count
		lastMessageId: string;
		lastTimeSeenAbove: Date | null;
		lastPingTime: Date | null;
		maxCount: number;
	} = {
		lastCount: NOT_YET_FETCHED,
		lastMessageId: "",
		lastTimeSeenAbove: null,
		lastPingTime: null,
		maxCount: 0,
	};

	// Helper to format date as relative time, or default text if null
	const formatRelativeTime = (
		date: Date | null,
		defaultText = "Never"
	): string => {
		return date ? time(date, TimestampStyles.RelativeTime) : defaultText;
	};

	// Build the paintball status embed
	const buildEmbed = (
		paintballCount: number | null,
		countDifference: number | null
	): EmbedBuilder => {
		const timeNow = new Date();
		const embed = new EmbedBuilder().setTimestamp();

		// Player count field
		const relativeSinceNow = time(timeNow, TimestampStyles.RelativeTime);
		let countValue: string;
		let embedColor: string;

		if (paintballData.lastCount === NOT_YET_FETCHED) {
			countValue = "Starting up...";
			embedColor = "#ffa500"; // Orange
		} else if (paintballData.lastCount === API_UNAVAILABLE) {
			countValue = `API Unavailable\nSince: ${relativeSinceNow}`;
			embedColor = "#ff6b6b"; // Red
		} else if (paintballCount !== null && countDifference !== null) {
			const differenceString =
				countDifference > 0
					? `+ ${countDifference}`
					: `\\-${countDifference * -1}`; // Double escape the minus sign for Discord formatting
			countValue = `${paintballCount} (${differenceString}) \n Since: ${relativeSinceNow}`;
			embedColor = "#cfc2ff"; // Purple
		} else {
			// Fallback (shouldn't happen)
			countValue = "Unknown";
			embedColor = "#808080"; // Gray
		}

		embed.setColor(embedColor as `#${string}`);
		embed.addFields({
			name: "Paintball player count:",
			value: countValue,
			inline: false,
		});

		// Last time above threshold
		const lastSeenAbove = formatRelativeTime(
			paintballData.lastTimeSeenAbove
		);
		embed.addFields({
			name: `Last time player count was above ${numToAlert}:`,
			value: lastSeenAbove,
			inline: false,
		});

		// Last ping time
		const lastPing = formatRelativeTime(paintballData.lastPingTime);
		embed.addFields({
			name: "Last ping:",
			value: lastPing,
			inline: false,
		});

		// Max count
		embed.addFields({
			name: "Max player count seen:",
			value: String(paintballData.maxCount),
			inline: false,
		});

		return embed;
	};

	// Update or create the Discord message with the embed
	const updateMessage = async (
		channel: TextChannel,
		embed: EmbedBuilder,
		info: string
	): Promise<void> => {
		const reactionEmoji = "⚪";
		try {
			const message = await channel.messages.fetch(
				paintballData.lastMessageId
			);
			await message.edit({ embeds: [embed], content: info });
			if (!message.reactions.cache.get(reactionEmoji)?.me) {
				await message.react(reactionEmoji);
			}
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
					JSON.stringify({
						lastPaintballPlayerMessageId:
							paintballData.lastMessageId,
					})
				);
			} catch (e) {
				console.error("Failed to persist paintball message id:", e);
			}
			void newMessage.react(reactionEmoji);
		}
	};

	try {
		const raw = fs.readFileSync(messageIdFile, {
			encoding: "utf8",
			flag: "r",
		});
		if (raw && raw.trim()) {
			const parsed = JSON.parse(raw) as Partial<PaintballData>;
			paintballData.lastMessageId =
				parsed.lastPaintballPlayerMessageId || "";
		}
	} catch (_) {
		// If file missing or invalid, ignore; we'll create a new message
	}

	const scheduler = new ToadScheduler();
	const task = new AsyncTask("paintballCounts", async () => {
		const guild = client.guilds.cache.get(guildId);
		if (!guild) return;

		const channel = guild.channels.cache.find(
			(C) => C.id == channelId
		) as TextChannel;
		if (!channel) return;

		let role = guild.roles.cache.find((r) => r.name === roleName);
		if (!role) {
			try {
				role = await guild.roles.create({
					name: roleName,
					mentionable: true,
					reason: `Auto-created role '${roleName}'`,
				});
			} catch (error) {
				console.error(`Failed to create role '${roleName}':`, error);
			}
		}

		const rolePing = role
			? roleMention(role.id)
			: "No role, and failed to create. Please make one called 'Paintball'";

		const info = `Info: Will ghost ping ${rolePing}
            whenever there are ${numToAlert} players.
            Won't ping if already pinged within last ${minutesBetweenAlerts} minutes.
            React with :white_circle: to receive the role.
            Remove reaction to remove role.`;

		try {
			const uri = `https://api.hypixel.net/v2/counts?key=${hypixelApiKey}`;
			const response = await axios.get(uri);
			const hypixelData = response.data as HypixelCountsResponse;
			const paintball = Number(hypixelData.games.LEGACY.modes.PAINTBALL);

			// Skip update if count hasn't changed
			if (paintball === paintballData.lastCount) return;

			const pbDifference = paintball - paintballData.lastCount;
			paintballData.lastCount = paintball;

			// Update max count if needed
			if (paintball > paintballData.maxCount) {
				paintballData.maxCount = paintball;
			}

			// Check if we should ping and update last seen above threshold
			const timeNow = new Date();
			if (paintball >= numToAlert) {
				paintballData.lastTimeSeenAbove = timeNow;

				const shouldPing =
					role &&
					role.members.size > 0 &&
					(!paintballData.lastPingTime ||
						timeNow.getTime() -
							paintballData.lastPingTime.getTime() >
							timeBetweenAlertsMs);

				if (shouldPing) {
					paintballData.lastPingTime = timeNow;
					const ghostPing = await channel.send(rolePing);
					await ghostPing.delete();
				}
			}

			const embed = buildEmbed(paintball, pbDifference);
			await updateMessage(channel, embed, info);
		} catch (error) {
			// Handle network errors with less verbose logging to avoid spam
			if (axios.isAxiosError(error)) {
				const code = error.code;
				if (
					code === "ETIMEDOUT" ||
					code === "ENETUNREACH" ||
					code === "ECONNREFUSED"
				) {
					// If API was already unavailable, don't spam message updates
					if (paintballData.lastCount === API_UNAVAILABLE) return;

					console.warn(
						`Hypixel API temporarily unreachable (${code}). Updating embed.`
					);

					paintballData.lastCount = API_UNAVAILABLE;
					const embed = buildEmbed(null, null);
					await updateMessage(channel, embed, info);
					return;
				}
			}
			// Log full error for unexpected issues
			console.error(
				"Error fetching data or processing paintball counts: ",
				error
			);
		}
	});

	const job = new SimpleIntervalJob({ seconds: 10 }, task);
	scheduler.addSimpleIntervalJob(job);
};
