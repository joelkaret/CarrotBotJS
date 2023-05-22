const { SlashCommandBuilder } = require("discord.js");
const { QueryType, useQueue } = require("discord-player");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the queue")
        .addIntegerOption((option) =>
            option
                .setName("number")
                .setDescription("Max number of songs to display")
        ),
    async execute(interaction) {
        await interaction.reply("Working...");

        try {
            const queue = useQueue(interaction.guild);

            if (queue.isEmpty() || !queue.node.isPlaying()) {
                return interaction.editReply({
                    content: "There is nothing playing",
                });
            }

            let maxNum = interaction.options.getInteger("number");
            if (!maxNum) {
                maxNum = 10
            }

            if (maxNum > queue.getSize()) {
                maxNum = queue.getSize()
            }

            if (maxNum > 50) {
                return interaction.editReply(
                    "Max number of songs to display is 50."
                );
            }

            const tracks = queue.tracks.data;
            const embed = new EmbedBuilder()
                .setColor("#9F2B68")

            let message = `\`Current Song\` - **${queue.currentTrack.title}** - ${queue.currentTrack.author}`;
            for (let i = 0; i < maxNum; i++) {
                message = `${message}\n\`${i + 1}\`\u205F\u205F|\u205F\u205F**${tracks[i].title}** - ${tracks[i].author}`;
            }
            embed.addFields({ name: "Queue", value: message, inline: false });

            await interaction.editReply(
                {content: ' ', embeds: [embed]}
            );
        } catch (error) {
            console.log(error);
        }
    },
};
