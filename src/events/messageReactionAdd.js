require('dotenv').config();
const clientId = process.env.clientId

module.exports = {
	name: 'messageReactionAdd',
	once: false,
	async execute(reaction, user, client) {
		const member = reaction.message.guild.members.cache.get(user.id)
		if (user.id == clientId) return;
		if (reaction.emoji.toString() == '🪥' && String(member.id) == "506884005195677696") {
			reaction.message.delete()
			return;
		};
		if (reaction.message.channelId != 918550313693245470) return;
		let emojiList = [
			client.emojis.cache.find(emoji => emoji.name === "agree"),
			client.emojis.cache.find(emoji => emoji.name === "disagree")
		];
		if (!(emojiList.indexOf(reaction.emoji) >= 0)) {
			reaction.users.remove(user);
			return;
		};
		if (!(member.roles.cache.some(role => role.name === 'Veteran') || member.roles.cache.some(role => role.name === 'Guild Staff'))){
			await reaction.message.reply({ content: `${member} You do not have permssion to do this.`, ephemeral: true })
			return;
		};
	},
};