const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("clear the queue"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try {

        const queue = useQueue(interaction.guild)

        if (!queue) {
            return interaction.editReply({ content: "There is no queue!" })
        }

        await queue.tracks.clear()

        return interaction.editReply({ content: "Queue cleared successfully!" })
    }catch (error) {
        console.log(error)
    }
}
}