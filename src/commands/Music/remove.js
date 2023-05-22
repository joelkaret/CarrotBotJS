const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("remove a specific track from queue")
        .addIntegerOption(option => option
            .setName("number")
            .setDescription("the number from queue you want to remove ")
            .setRequired(true)
        ),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try {
        const queue = useQueue(interaction.guild)

        if (!queue) {
            return interaction.editReply({ content: "There is nothing playing", ephemeral: true })
        }

        const trackIndex = interaction.options.getInteger("number") - 1;
        queue.node.remove(trackIndex)

        interaction.editReply(`Removed`)

    }catch (error) {
        console.log(error)
    }
    }
}