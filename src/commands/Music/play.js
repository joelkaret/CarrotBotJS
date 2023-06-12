const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");
const {
    YouTubeExtractor,
    SpotifyExtractor,
    AppleMusicExtractor,
} = require("@discord-player/extractor");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("new play command")
        .addStringOption((option) =>
            option.setName("string").setDescription("query").setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("247")
                .setDescription("24/7")
                .addChoices(
                    { name: "yes", value: "false" },
                    { name: "no", value: "true" }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.reply("Working...");
            interaction.client.player.extractors.register(YouTubeExtractor);
            interaction.client.player.extractors.register(SpotifyExtractor);
            interaction.client.player.extractors.register(AppleMusicExtractor);

            try {
                const stri = interaction.options.getString("247");
                const check = interaction.options.getString("string");

                const result = await interaction.client.player.search(check, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO,
                });

                const results = new EmbedBuilder()
                    .setTitle(`No results`)
                    .setColor(`#ff0000`)
                    .setTimestamp();

                if (!result.hasTracks()) {
                    return interaction.editReply({ embeds: [results] });
                }

                await interaction.editReply({
                    content: `Loading a: ${
                        result.playlist ? "playlist" : "track"
                    }`,
                });

                const yes = await interaction.client.player.play(
                    interaction.member.voice.channel?.id,
                    result,
                    {
                        nodeOptions: {
                            metadata: {
                                channel: interaction.channel,
                                client: interaction.guild?.members.me,
                                requestedBy: interaction.user.username,
                            },
                            volume: 20,
                            bufferingTimeout: 3000,
                            leaveOnEnd: stri === "false" ? false : true,
                        },
                    }
                );

                const embed = new EmbedBuilder();
                function yess() {
                    const totalDurationMs = yes.track.playlist.tracks.reduce(
                        (a, c) => c.durationMS + a,
                        0
                    );
                    const totalDurationSec = Math.floor(totalDurationMs / 1000);
                    const hours = Math.floor(totalDurationSec / 3600);
                    const minutes = Math.floor((totalDurationSec % 3600) / 60);
                    const seconds = totalDurationSec % 60;
                    const durationStr = `${hours
                        .toString()
                        .padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds
                        .toString()
                        .padStart(2, "0")}`;
                    return durationStr;
                }

                embed
                    .setDescription(
                        `${
                            yes.track.playlist
                                ? `**multiple tracks** from: **${yes.track.playlist.title}**`
                                : `**${yes.track.title}**`
                        }`
                    )
                    .setThumbnail(
                        `${
                            yes.track.playlist
                                ? `${yes.track.playlist.thumbnail.url}`
                                : `${yes.track.thumbnail}`
                        }`
                    )
                    .setColor(`#00ff08`)
                    .setTimestamp()
                    .setFooter({
                        text: `Duration: ${
                            yes.track.playlist
                                ? `${yess()}`
                                : `${yes.track.duration}`
                        } | Event Loop Lag ${interaction.client.player.eventLoopLag.toFixed(
                            0
                        )}`,
                    });
                return interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.log("error 2");
                console.log(error);
            }
        } catch (error) {
            console.log("error 1");
            console.log(error);
        }
    },
};
