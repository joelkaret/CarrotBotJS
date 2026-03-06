import type { Client, ButtonInteraction, CommandInteraction } from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";

export interface CommandData {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction, client: Client) => Promise<void>;
}

export interface ButtonData {
	data: {
		name: string;
	};
	execute: (interaction: ButtonInteraction, client?: Client) => Promise<void>;
}

export interface EventData {
	name: string;
	once?: boolean;
	execute: (...args: unknown[]) => Promise<void> | void;
}

export interface MongoEventData {
	name: string;
	once?: boolean;
	execute: (...args: unknown[]) => void;
}

export interface PaintballData {
	lastCount: number;
	lastMessageId: string;
	lastTimeSeenAbove: string;
	lastPingTime: string | Date;
	maxCount: number;
	lastPaintballPlayerMessageId?: string;
}

export interface HypixelCountsResponse {
	success: boolean;
	games: {
		LEGACY: {
			modes: {
				PAINTBALL: number;
			};
		};
	};
}

export interface MojangProfileResponse {
	id: string;
	name: string;
}
