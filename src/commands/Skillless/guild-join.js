const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guild-join')
		.setDescription("Apply to the guild.")
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('Your in game name.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('age')
				.setDescription('Your age.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('country')
				.setDescription('Your Time Zone / Country.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('friends')
				.setDescription('Do you know people in the guild, if not how did you find out about the guild?')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('why')
				.setDescription('Why do you want to join the guild?')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('activity')
				.setDescription('How active are you on Hypixel?')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('fit')
				.setDescription('Why are you a good fit for the guild?')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('other')
				.setDescription('Any other comments or anything we should know?')
				.setRequired(true)),


	async execute(interaction, client) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Public Members')) {
			await interaction.reply({ content: `${interaction.member} You do not have permssion to do this.`, ephemeral: true })
			return
		};
		const button_row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('accept')
				.setLabel('Accept')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('delete')
				.setLabel('Delete')
				.setStyle('DANGER')
		);

		const user = interaction.user

		const ign = interaction.options.getString('ign')
		const age = interaction.options.getString('age')
		const country = interaction.options.getString('country')
		const friends = interaction.options.getString('friends')
		const why = interaction.options.getString('why')
		const activity = interaction.options.getString('activity')
		const fit = interaction.options.getString('fit')
		const other = interaction.options.getString('other')

		const embed = new EmbedBuilder()
			.setColor('#cfc2ff')
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setDescription(`${user}`)
			.setThumbnail('https://media.discordapp.net/attachments/713696156462612530/811532958933975080/skilllessgif.gif')
			.addFields(
				{ name: 'IGN', value: ign, inline: false },
				{ name: 'Age', value: age, inline: false },
				{ name: 'Timezone/Country', value: country, inline: false },
				{ name: 'Friends/Discovered Guild', value: friends, inline: false },
				{ name: 'Why do you want to join?', value: why, inline: false },
				{ name: 'Activity', value: activity, inline: false },
				{ name: 'Why are you a good fit for the guild?', value: fit, inline: false },
				{ name: 'Other', value: other, inline: false },
			)
			.setTimestamp()
			.setFooter({ text: user.id })
		const channel = interaction.guild.channels.cache.get("918550313693245470")
		const message = await channel.send({ embeds: [embed], components: [button_row], fetchReply: true })
		// let agree = '✅'
		// let disagree = '❌'
		let agree = client.emojis.cache.find(emoji => emoji.name === "agree");
		let disagree = client.emojis.cache.find(emoji => emoji.name === "disagree");
		//❌✅✔️✖️
		await message.react(agree.id);
		await message.react(disagree.id);
		await interaction.reply({ content: `${interaction.member} Application sent in #guild-join-info`, ephemeral: true })
	}
};