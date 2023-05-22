
const { SlashCommandBuilder } = require("discord.js");
const {QueryType, useQueue} = require("discord-player")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("playnext")
        .setDescription("song to play next right after the one is playing right now")
        .addStringOption(option => option
            .setName("name")
            .setDescription("name of song")
        ),
    async execute(interaction) {
		await interaction.reply('Working...')
		
        try{
        const queue = useQueue(interaction.guild)

        if (!queue || !queue.isPlaying()) {
            return interaction.editReply({ content: 'There is nothing playing' })
        }

        const query = interaction.options.getString("name")
        const searchResults = await interaction.client.player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        })

        if (!searchResults || !searchResults.tracks.length) {
            return interaction.editReply({ content: 'No results' })
        }

        queue.insertTrack(searchResults.tracks[0], 0)

        await interaction.editReply("Successfully changed the order")

    }catch (error) {
        console.log(error)
    }
    }
}