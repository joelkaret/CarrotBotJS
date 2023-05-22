const { useHistory } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("previous")
        .setDescription("play previous song"),
    async execute(interaction) {
		await interaction.reply('Working...')
        try{
        const history = useHistory(interaction.guild)


        if (!history) {
            return interaction.editReply({ content: "There is no history!" })
        }

        await history.previous();
        return interaction.editReply({ content: `Playing previous song, [${lastSong.title}](${lastSong.url})` })
    } catch (error) {
        console.log(error)
    }
    }
}