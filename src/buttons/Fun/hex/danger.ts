import type { ButtonInteraction, Client } from "discord.js";

export default {
	data: {
		name: "danger",
	},
	async execute(interaction: ButtonInteraction, _client: Client) {
		void interaction.deferUpdate();
		await interaction.message.edit({ content: "Colour Danger: #ED4245" });
	},
};
