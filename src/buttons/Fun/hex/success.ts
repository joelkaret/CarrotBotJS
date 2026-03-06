import type { ButtonInteraction, Client } from "discord.js";

export default {
	data: {
		name: "success",
	},
	async execute(interaction: ButtonInteraction, _client: Client) {
		void interaction.deferUpdate();
		await interaction.message.edit({ content: "Colour Success: #57F287" });
	},
};
