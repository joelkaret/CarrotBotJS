const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("stop current queue"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try{
        const queue = useQueue(interaction.guild)

        if (!queue && !queue.isPlaying()) {
            return interaction.editReply({ content: 'nothing playing', ephemeral: true })
        }

        queue.delete(interaction.guild?.id);
        await interaction.editReply("Queue stopped")
    }catch (error) {
        console.log(error)
    }
    }
}