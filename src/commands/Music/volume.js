const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("set volume")
        .addIntegerOption((option) =>
            option.setName("number").setDescription("number of volume")
        ),
    async execute(interaction) {
        await interaction.reply("Working...");

        try {
            const queue = useQueue(interaction.guild);

            if (!queue && !queue.isPlaying()) {
                return interaction.editReply("There is nothing playing");
            }

            const vol = parseInt(interaction.options.getInteger("number"));

            if (!vol) {
                return interaction.editReply(
                    `Current volume is ${queue.node.volume}`
                );
            }

            const success = queue.node.setVolume(vol);

            interaction.editReply({
                content: success
                    ? `volume set to ${vol}`
                    : "something went wrong",
            });
        } catch (error) {
            console.log(error);
        }
    },
};
