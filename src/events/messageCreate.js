const { Interaction } = require('discord.js');
const { MessageEmbed } = require('discord.js');

const loggerGuildId = "940647396461912134"

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (message.guildId == loggerGuildId) return;
		const loggerGuild = client.guilds.cache.get(loggerGuildId)
		let channelName = `${message.channel.name}_${message.guild.name}`
		channelName = channelName.split(' ').join('-').toLowerCase()
		let channel = loggerGuild.channels.cache.find(C => C.name == channelName)
		if (!channel) {
			channel = await loggerGuild.channels.create(channelName)
		}
		const userName = message.member.nickname ? message.member.nickname : message.author.username
		const embed = new MessageEmbed()
			.setColor('#FFFFFF')
			.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
			.setDescription(`Nickname: ${userName}`)
			.setTimestamp()
		if (message.reference) {
			const replied = await message.channel.messages.fetch(`${message.reference.messageId}`);
			embed.addFields({ name: `Reply to: ${replied.author.tag}`, value: `:${replied.content}` })
		}
		await channel.send({ embeds: [embed] })
		if (message.embeds) {
			await channel.send({
				content: message.content,
				embeds: message.embeds,
				components: message.components,
				files: [...message.attachments.values()],
				fetchReply: true,
			});
			return;
		}
		await channel.send({
			content: message.content,
			components: message.components,
			files: [...message.attachments.values()],
			fetchReply: true,
		});
	},
};