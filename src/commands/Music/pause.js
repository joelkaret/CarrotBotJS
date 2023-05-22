const { SlashCommandBuilder } = require("@discordjs/builders")
const { useQueue } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current song"),
	async execute(interaction){
		await interaction.reply('Working...')
		
        // Get the queue for the server
		const queue = useQueue(interaction.guildId)

        // Check if the queue is empty
		if (!queue)
		{
			await interaction.editReply("There are no songs in the queue")
			return;
		}
		const pauseState = queue.node.isPaused()
		if (pauseState) {
			await interaction.editReply("Player is already paused.")
			return;
		}
        // Pause the current song
		queue.node.setPaused(true);

        await interaction.editReply("Player has been paused.")
	},
}