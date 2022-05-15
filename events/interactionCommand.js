const { CommandInteraction } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {

		if (interaction.isCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;

			try{
				await command.execute(interaction);
			} catch (err) {
				if (err) console.error(err);
				await interaction.reply({
					content: "An error has occured with this command.",
					ephermeral: true,
				});
			}

		} else if (interaction.isSelectMenu()) {
			if (interaction.customId.includes('-commandName')) {
				pass
				// Code here for select menu
			}

		} else if (interaction.isButton()) {

			const button = client.buttons.get(interaction.customId);

			if (!button) return;

			try{
				await button.execute(interaction);
			} catch (err) {
				if (err) console.error(err);
				await interaction.reply({
					content: "An error has occured with this button.",
					ephermeral: true,
				});
			}
		}
	},
	
};