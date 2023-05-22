const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("resume"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try{
        const queue = useQueue(interaction.guild)

        if (!queue || !queue.isPlaying()) {
            return interaction.editReply("There is nothing playing")
        }
        const pauseState = queue.node.isPaused()
		if (pauseState) {
			await interaction.editReply("Player is not paused.")
			return;
		}
        queue.node.setPaused(false)
        return interaction.editReply("Resumed successfully.")
    }catch (error) {
        console.log(error)
    }
}
}