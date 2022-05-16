const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guild-join')
		.setDescription("Apply to the guild.")
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('Your in game name.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('discoveredguild')
				.setDescription('How you found out about the guild.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('aboutme')
				.setDescription('Tell us about yourself.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('aliases')
				.setDescription('Any other names you are known by.')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('age')
				.setDescription('Your age.')
				.setRequired(false)),
	async execute(interaction) {
		const ign = interaction.options.getString('ign')
		const aliases = interaction.options.getString('aliases') || "No Aliases."
		const age = interaction.options.getString('age') || "Not given."
		const discovered_guild = interaction.options.getString('discoveredguild')
		const about_me = interaction.options.getString('aboutme')
		const user = interaction.user

		const embed = new MessageEmbed()
			.setColor('#cfc2ff')
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setDescription(`${user}`)
			.setThumbnail('https://media.discordapp.net/attachments/713696156462612530/811532958933975080/skilllessgif.gif')
			.addFields(
				{ name: 'IGN', value: ign, inline: false },
				{ name: 'Aliases', value: aliases, inline: false },
				{ name: 'Age', value: age, inline: false },
				{ name: 'Discovered Guild', value: discovered_guild, inline: false },
				{ name: 'About Me', value: `${about_me}\n\u200B`, inline: false },
			)
			.setTimestamp()
			.setFooter({ text: user.id })
		await interaction.reply({ embeds: [embed] })
	}
};