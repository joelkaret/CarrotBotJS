const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skip current song"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try{
        const queue = useQueue(interaction.guild)

        if (!queue && !queue.isPlaying()) {
            return interaction.editReply({ content: "There is nothing playing" })
        }

        const currentTrack = queue.currentTrack
        queue.node.skip()
        return interaction.editReply({ content: `Skipped ${currentTrack}` })
    }catch (error) {
        console.log(error)
    }
    }
}