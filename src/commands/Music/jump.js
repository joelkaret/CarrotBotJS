const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("jump")
        .setDescription("jump to a specific song in the queue")
        .addIntegerOption(option => option
            .setName("value")
            .setDescription("number of the song")
            .setRequired(true)
        ),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try {

        const tracks = interaction.options.getInteger("value")
        const queue = useQueue(interaction.guild)

        if (!queue) {
            return interaction.editReply({ content: "There is no queue!" })
        }

        const trackIndex = tracks - 1;

        await queue.node.jump(trackIndex)

        return interaction.editReply({ content: "Jumped successfully successfully!" })
    }catch (error) {
        console.log(error)
    }
}
}