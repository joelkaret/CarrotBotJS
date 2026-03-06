import type { ButtonInteraction, Client } from "discord.js";

export default {
	data: {
		name: "primary",
	},
	async execute(interaction: ButtonInteraction, _client: Client) {
		void interaction.deferUpdate();
		await interaction.message.edit({ content: "Colour Primary: #5865F2" });
	},
};
