const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("see what is playing right now"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try {

        const queue = useQueue(interaction.guild)

        if (!queue && !queue.isPlaying()) {
            return interaction.editReply({ content: "There is not playing anything"})
        }

        const progress = queue.node.createProgressBar()
        const ts = queue.node.getTimestamp();

        const embed = new EmbedBuilder()
            .setTitle("Now playing")
            .setDescription(`[${queue.currentTrack.title}](${queue.currentTrack.url})`)
            .setThumbnail(`${queue.currentTrack.thumbnail}`)
            .addFields(
                { name: '\200', value: progress.replace(/ 0:00/g, 'LIVE') }
            )

        await interaction.editReply({ content: '', embeds: [embed] })
    }catch (error) {
        console.log(error)
    }
}
}