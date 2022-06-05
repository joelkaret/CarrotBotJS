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
		if (message.webhook) {
			console.log(message.webhook)
			console.log(message)
			return;
		}
		const member = message.guild.members.fetch(message.author.id)
		const userName = member.nickname ? member.nickname : message.author.username
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
		let newMessage = { fetchReply: true }
		if (message.embeds) newMessage.embeds = message.embeds
		if (message.content) newMessage.content = message.content
		if (message.components) newMessage.components = message.components
		if (message.attachments) newMessage.files = [...message.attachments.values()]
		await channel.send(newMessage);
	},
};