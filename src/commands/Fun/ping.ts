import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, Client } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	async execute(interaction: ChatInputCommandInteraction, _client: Client) {
		return interaction.reply(
			`🏓Latency is ${Date.now() - interaction.createdTimestamp}ms.`
		);
	},
};
