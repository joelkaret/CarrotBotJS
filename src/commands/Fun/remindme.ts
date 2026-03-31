import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v10";
import type {
	ChatInputCommandInteraction,
	Client,
	Guild,
	GuildMember,
} from "discord.js";
import mongoose from "mongoose";
import ReminderModel from "../../schemas/reminder";
import {
	scheduleReminder,
	cancelScheduledReminder,
} from "../../utils/reminderScheduler";

const MAX_REMINDERS_PER_USER = 10;
const MIN_MS = 60_000; // 1 minute
const MAX_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// ─── Duration parser ────────────────────────────────────────────────────────

function unitToMs(unit: string): number | null {
	const u = unit.toLowerCase();
	if (u.startsWith("y")) return 365 * 24 * 60 * 60 * 1000;
	if (u.startsWith("mo")) return 30 * 24 * 60 * 60 * 1000;
	if (u.startsWith("w")) return 7 * 24 * 60 * 60 * 1000;
	if (u.startsWith("d")) return 24 * 60 * 60 * 1000;
	if (u.startsWith("h")) return 60 * 60 * 1000;
	if (u.startsWith("mi") || u === "m") return 60 * 1000;
	if (u.startsWith("s")) return 1000;
	return null;
}

function parseDuration(input: string): number | null {
	const pattern =
		/(\d+)\s*(years?|yrs?|months?|mos?|weeks?|wks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|[ymwdhs])\b/gi;
	let total = 0;
	let found = false;

	for (const match of input.matchAll(pattern)) {
		const n = parseInt(match[1], 10);
		const ms = unitToMs(match[2]);
		if (ms !== null) {
			total += n * ms;
			found = true;
		}
	}

	return found ? total : null;
}

// ─── Absolute date parser (UTC) ─────────────────────────────────────────────

const MONTHS: Record<string, number> = {
	january: 0,
	jan: 0,
	february: 1,
	feb: 1,
	march: 2,
	mar: 2,
	april: 3,
	apr: 3,
	may: 4,
	june: 5,
	jun: 5,
	july: 6,
	jul: 6,
	august: 7,
	aug: 7,
	september: 8,
	sep: 8,
	sept: 8,
	october: 9,
	oct: 9,
	november: 10,
	nov: 10,
	december: 11,
	dec: 11,
};

const MONTH_PATTERN = Object.keys(MONTHS).join("|");
const ORDINAL = "(?:st|nd|rd|th)?";

function makeUTCDate(
	year: number,
	month: number,
	day: number,
	hour = 0,
	minute = 0
): Date | null {
	const d = new Date(Date.UTC(year, month, day, hour, minute));
	// Validate (e.g. Feb 30 would roll over)
	if (
		d.getUTCFullYear() !== year ||
		d.getUTCMonth() !== month ||
		d.getUTCDate() !== day
	) {
		return null;
	}
	return d;
}

function parseAbsoluteDate(input: string): Date | null {
	// ISO: YYYY-MM-DD[T ]HH:MM
	let m = input.match(
		/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?/
	);
	if (m) {
		return makeUTCDate(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
	}

	// ISO date only: YYYY-MM-DD
	m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (m) {
		return makeUTCDate(+m[1], +m[2] - 1, +m[3]);
	}

	// D[ord] Month YYYY [HH:MM]
	m = input.match(
		new RegExp(
			`^(\\d{1,2})${ORDINAL}\\s+(${MONTH_PATTERN})\\s+(\\d{4})(?:\\s+(\\d{1,2}):(\\d{2}))?$`,
			"i"
		)
	);
	if (m) {
		const month = MONTHS[m[2].toLowerCase()];
		if (month !== undefined) {
			return makeUTCDate(
				+m[3],
				month,
				+m[1],
				m[4] ? +m[4] : 0,
				m[5] ? +m[5] : 0
			);
		}
	}

	// Month D[ord] YYYY [HH:MM]
	m = input.match(
		new RegExp(
			`^(${MONTH_PATTERN})\\s+(\\d{1,2})${ORDINAL}\\s+(\\d{4})(?:\\s+(\\d{1,2}):(\\d{2}))?$`,
			"i"
		)
	);
	if (m) {
		const month = MONTHS[m[1].toLowerCase()];
		if (month !== undefined) {
			return makeUTCDate(
				+m[3],
				month,
				+m[2],
				m[4] ? +m[4] : 0,
				m[5] ? +m[5] : 0
			);
		}
	}

	return null;
}

function parseWhen(input: string): Date | null {
	const durationMs = parseDuration(input);
	if (durationMs !== null && durationMs > 0) {
		return new Date(Date.now() + durationMs);
	}
	return parseAbsoluteDate(input.trim());
}

// ─── Mention sanitisation ────────────────────────────────────────────────────

function computeAllowedMentions(
	message: string,
	member: GuildMember,
	guild: Guild
): { everyone: boolean; roles: string[] } {
	const canMentionEveryone = member.permissions.has(
		PermissionFlagsBits.MentionEveryone
	);

	const roleMentionIds = [...message.matchAll(/<@&(\d+)>/g)].map((m) => m[1]);

	const allowedRoles: string[] = [];
	for (const roleId of roleMentionIds) {
		const role = guild.roles.cache.get(roleId);
		if (!role) continue;
		if (role.mentionable || canMentionEveryone) {
			allowedRoles.push(roleId);
		}
	}

	return {
		everyone: canMentionEveryone,
		roles: [...new Set(allowedRoles)],
	};
}

// ─── Subcommand handlers ─────────────────────────────────────────────────────

async function handleSet(
	interaction: ChatInputCommandInteraction,
	client: Client
): Promise<void> {
	if (!interaction.inCachedGuild()) return;

	const whenInput = interaction.options.getString("when", true);
	const messageInput = interaction.options.getString("message", true);

	const triggerAt = parseWhen(whenInput);

	if (!triggerAt) {
		await interaction.reply({
			content: `❌ Couldn't parse \`${whenInput}\`. Try a duration like \`2 hours\`, \`3 days\`, or a date like \`2nd April 2026 14:00\` (UTC).`,
			ephemeral: true,
		});
		return;
	}

	const now = Date.now();
	const diffMs = triggerAt.getTime() - now;

	if (diffMs < MIN_MS) {
		await interaction.reply({
			content: "❌ Reminder must be at least 1 minute in the future.",
			ephemeral: true,
		});
		return;
	}

	if (diffMs > MAX_MS) {
		await interaction.reply({
			content: "❌ Reminder cannot be more than 1 year away.",
			ephemeral: true,
		});
		return;
	}

	// Cap per-user reminders
	const existingCount = await ReminderModel.countDocuments({
		userId: interaction.user.id,
		guildId: interaction.guildId,
	});
	if (existingCount >= MAX_REMINDERS_PER_USER) {
		await interaction.reply({
			content: `❌ You already have ${MAX_REMINDERS_PER_USER} pending reminders. Cancel one first.`,
			ephemeral: true,
		});
		return;
	}

	const allowedMentions = computeAllowedMentions(
		messageInput,
		interaction.member,
		interaction.guild
	);

	const reminder = new ReminderModel({
		_id: new mongoose.Types.ObjectId(),
		userId: interaction.user.id,
		guildId: interaction.guildId,
		channelId: interaction.channelId,
		message: messageInput,
		triggerAt,
		createdAt: new Date(),
		allowedMentions,
	});

	await reminder.save();
	scheduleReminder(reminder, client);

	const ts = Math.floor(triggerAt.getTime() / 1000);
	await interaction.reply({
		content: `✅ Reminder set! I'll ping you <t:${ts}:R> (<t:${ts}:F>).\n> ${messageInput}`,
		ephemeral: true,
	});
}

async function handleList(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.inCachedGuild()) return;

	const reminders = await ReminderModel.find({
		userId: interaction.user.id,
		guildId: interaction.guildId,
	}).sort({ triggerAt: 1 });

	if (reminders.length === 0) {
		await interaction.reply({
			content: "You have no pending reminders.",
			ephemeral: true,
		});
		return;
	}

	const lines = reminders.map((r, i) => {
		const ts = Math.floor(r.triggerAt.getTime() / 1000);
		const preview =
			r.message.length > 60 ? r.message.slice(0, 57) + "..." : r.message;
		return `\`${i + 1}.\` <t:${ts}:F> — ${preview}`;
	});

	await interaction.reply({
		content: `**Your Reminders** (${reminders.length})\n${lines.join("\n")}`,
		ephemeral: true,
	});
}

async function handleCancel(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.inCachedGuild()) return;

	const number = interaction.options.getInteger("number", true);

	const reminders = await ReminderModel.find({
		userId: interaction.user.id,
		guildId: interaction.guildId,
	}).sort({ triggerAt: 1 });

	const reminder = reminders[number - 1];

	if (!reminder) {
		await interaction.reply({
			content: `❌ No reminder #${number}. Use \`/remindme list\` to see your reminders.`,
			ephemeral: true,
		});
		return;
	}

	cancelScheduledReminder(reminder._id.toString());
	await ReminderModel.findByIdAndDelete(reminder._id);

	const ts = Math.floor(reminder.triggerAt.getTime() / 1000);
	const preview =
		reminder.message.length > 60
			? reminder.message.slice(0, 57) + "..."
			: reminder.message;

	await interaction.reply({
		content: `✅ Cancelled reminder #${number} that was due <t:${ts}:R>.\n> ${preview}`,
		ephemeral: true,
	});
}

// ─── Command definition ──────────────────────────────────────────────────────

export default {
	data: new SlashCommandBuilder()
		.setName("remindme")
		.setDescription("Manage your reminders")
		.setDMPermission(false)
		.addSubcommand((sub) =>
			sub
				.setName("set")
				.setDescription("Set a new reminder")
				.addStringOption((opt) =>
					opt
						.setName("when")
						.setDescription(
							"Duration (e.g. '2 hours', '3 days') or UTC date (e.g. '2nd April 2026 14:00')"
						)
						.setRequired(true)
				)
				.addStringOption((opt) =>
					opt
						.setName("message")
						.setDescription("What to remind you of")
						.setRequired(true)
						.setMaxLength(500)
				)
		)
		.addSubcommand((sub) =>
			sub.setName("list").setDescription("List your pending reminders")
		)
		.addSubcommand((sub) =>
			sub
				.setName("cancel")
				.setDescription("Cancel a pending reminder")
				.addIntegerOption((opt) =>
					opt
						.setName("number")
						.setDescription("Reminder number from /remindme list")
						.setRequired(true)
						.setMinValue(1)
				)
		),

	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const subcommand = interaction.options.getSubcommand();

		try {
			if (subcommand === "set") {
				await handleSet(interaction, client);
			} else if (subcommand === "list") {
				await handleList(interaction);
			} else if (subcommand === "cancel") {
				await handleCancel(interaction);
			}
		} catch (error) {
			const msg = "❌ Something went wrong. Please try again.";
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply(msg);
			} else {
				await interaction.reply({ content: msg, ephemeral: true });
			}
			throw error;
		}
	},
};
