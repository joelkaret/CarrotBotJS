const leaderboard = require('../../../schemas/skillless-bwldb')
const { MessageEmbed } = require('discord.js');
const axios = require('axios')

module.exports = {
	data: {
		name: 'refresh'
	},
	async execute (interaction, client) {
		if (!(interaction.member.roles.cache.some(role => role.name === 'Guild Staff') || String(interaction.member.id) == "506884005195677696")){
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return;
		}
		mode = interaction.message.embeds[0].fields[0].name
		const tempEmbed = new MessageEmbed().setColor('#2C2F33')
		players = await leaderboard.find({ mode: mode })
		if (players.length == 0){
			await interaction.reply({ content: `${interaction.member} There is no data for this mode stored.`, ephemeral: true })
			return;
		}
		for (let i = 0; i < players.length; i++){
			const uri = `https://api.mojang.com/user/profiles/${players[i].uuid}/names`
			const { data } = await axios.get(uri)
			const ign = data[data.length - 1].name
			await ldbAdd(ign, players[i].uuid, players[i].winstreak, mode)
		};
		interaction.deferUpdate();
		for (let i = 0; i < players.length; i++) {
			for (let j = 0; j < players.length -i -1; j++) {
				if (players[j].winstreak < players[j+1].winstreak) {
					let temp = players[j]
					players[j] = players[j+1]
					players[j+1] = temp
				};
			};
		};
		let total = (players.length < 10) ? players.length : 10;
		let message = '' 
		for (let i = 0; i < total; i++) {
			message = `${message}\n\`${i+1}\`\u205F\u205F|\u205F\u205F**${players[i].ign}** - ${players[i].winstreak}`
		}
		tempEmbed.addFields(
			{ name: mode, value: message, inline: false }
		)
		await interaction.message.edit({ embeds: [tempEmbed], components: interaction.components, fetchReply: true })
	}
};

async function ldbAdd(ign, uuid, winstreak, mode) {
	let user = await leaderboard.findOne({ uuid: uuid, mode: mode })
	if (!user) {
		user = await new leaderboard({
			_id: mongoose.Types.ObjectId(),
			uuid: uuid,
			ign: ign,
			winstreak: winstreak,
			mode: mode,
		});
		await user.save().catch(err => console.log(err));
	};
	await leaderboard.findOneAndUpdate({ uuid: uuid, mode: mode }, { ign: ign, winstreak: winstreak });
	return user;
};