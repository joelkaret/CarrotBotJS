require('dotenv').config();
const clientId = process.env.clientId

module.exports = {
	name: 'messageReactionAdd',
	once: false,
	async execute(reaction, user, client) {

		if (reaction.partial) {
			// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
			try {
				await reaction.fetch();
			} catch (error) {
				console.error('Something went wrong when fetching the message:', error);
				// Return as `reaction.message.author` may be undefined/null
				return;
			}
		}

		const member = reaction.message.guild.members.cache.get(user.id)
		if (user.id == clientId) return;
		if (reaction.emoji.toString() == '🪥' && String(member.id) == "506884005195677696") {
			reaction.message.delete()
			return;
		};
		// if (reaction.emoji.toString() == '💼' && String(member.id) == "506884005195677696") {
		// 	const role = await reaction.message.guild.roles.cache.find(role => role.name === "Public Members");
		// 	const userId = reaction.message.author.id
		// 	const member = await reaction.message.guild.members.fetch(userId)
		// 	member.roles.add(role)
		// 	return;
		// };
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
			reaction.users.remove(user);
			return;
		};
	},
};