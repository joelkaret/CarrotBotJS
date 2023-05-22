const { SlashCommandBuilder } = require("discord.js");
const {QueryType, useQueue} = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("shuffle the queue"),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try{
        const queue = useQueue(interaction.guild)

        if (!queue || !queue.isPlaying()) {
            return interaction.editReply({ content: "There is nothing in queue!", ephemeral: true })
        }

        await queue.tracks.shuffle();
        interaction.editReply(`Queue shuffled`)

    }catch (error) {
        console.log(error)
    }
    }
}