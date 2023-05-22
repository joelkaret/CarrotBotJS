const { EmbedBuilder } = require("discord.js");

const loggerGuildId = "940647396461912134";

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message, client) {
        try {
            if (message.guildId == loggerGuildId) {
                if (message.content == "del") {
                    message.channel.delete();
                }
                if (message.content == "del tickets") {
                    let channels = message.guild?.channels
                        ? JSON.parse(JSON.stringify(message.guild.channels))
                              .guild.channels
                        : [];
                    for (let channelId of channels) {
                        let channel = client.channels.cache.get(channelId);
                        console.log(channel.name);
                        if (
                            channel.name.includes("ticket") ||
                            channel.name.includes("closed")
                        ) {
                            console.log(`Deleting ${channel.name}`);
                            channel.delete();
                        }
                    }
                    await message.reply("deleted all tickets");
                }
                return;
            }
            const loggerGuild = client.guilds.cache.get(loggerGuildId);
            let channelName = `${message.channel.name}_${message.guild.name}`;
            channelName = channelName.split(" ").join("-").toLowerCase();
            let channel = loggerGuild.channels.cache.find(
                (C) => C.name == channelName
            );
            if (!channel) {
                channel = await loggerGuild.channels.create(channelName);
            }
            let webhookBool = false;
            let userId;
            try {
                const webhook = await client.fetchWebhook(message.webhookId);
                webhookBool = true;
                userId = webhook.owner.id;
            } catch (error) {
                userId = message.author.id;
            }

            const member = message.guild.members.fetch(userId);
            const userName = member.nickname
                ? member.nickname
                : message.author.username;
            const embed = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setAuthor({
                    name: message.author.tag,
                    iconUrl: message.author.displayAvatarURL(),
                })
                .setDescription(`Nickname: ${userName}`)
                .setTimestamp();
            if (message.reference) {
                const replied = await message.channel.messages.fetch(
                    `${message.reference.messageId}`
                );
                embed.addFields({
                    name: `Reply to: ${replied.author.tag}`,
                    value: `:${replied.content}`,
                });
            }
            if (webhookBool) {
                embed.setFooter({ text: "This is a webhook." });
            }
            await channel.send({ embeds: [embed] });
            let newMessage = { fetchReply: true };
            if (message.embeds) newMessage.embeds = message.embeds;
            if (message.content) newMessage.content = message.content;
            if (message.components) newMessage.components = message.components;
            if (message.attachments)
                newMessage.files = [...message.attachments.values()];
            await channel.send(newMessage);
        } catch (err) {
            try {
                if (message.author.bot) return;
            } catch (err) {
                console.log(
                    `Uh oh, something went wrong, byebye actual logs, hello easy fix`
                );
                console.log(err);
            }
        }
    },
};
