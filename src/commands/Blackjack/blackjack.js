const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionResponseType } = require('discord-api-types/v10');
const { MessageActionRow, MessageButton } = require('discord.js');
const balance = require('../../schemas/balance.js')
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Play blackjack.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('balance')
				.setDescription('Check your own balance.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('play')
				.setDescription('Play a game.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('donate')
				.setDescription('Donate coins to another member in the server.')
				.addUserOption(option =>
					option.setName('member')
						.setDescription('The member to whom you want to give coins.')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('amount')
						.setDescription('The amount you want to donate.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('daily')
				.setDescription('Receive your daily random coins.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription("Set a user's coins value")
				.addUserOption(option =>
					option.setName('member')
						.setDescription('The member of whom you want to set the coin value.')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('amount')
						.setDescription('The amount you want to set.')
						.setRequired(true))),
	async execute(interaction, client) {
		if (interaction.options.getSubcommand() === 'balance') {
			const userBP = await balanceAdd(interaction.user.id, interaction.guildId);
			await interaction.reply({
				content: `You have ${userBP.amount} coins.`,
				ephemeral: false
			});
		} else if (interaction.options.getSubcommand() === 'play') {
			const row = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('play')
					.setLabel('Play')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('quit')
					.setLabel('Quit')
					.setStyle('DANGER'),
			);
			await interaction.reply({
				content: 'Play blackjack',
				components: [row]
			});
		} else if (interaction.options.getSubcommand() === 'donate') {
			const amount = interaction.options.getInteger('amount');
			const negAmount = amount * -1;
			if (amount < 100) {
				await interaction.reply({
					content: `${interaction.member}, you must donate more than 100 coins at once.`,
					ephemeral: false
				});
			};
			const member = interaction.options.getUser('member');
			const memberBP = await balanceAdd(member.id, interaction.guildId, amount);
			const userBP = await balanceAdd(interaction.user.id, interaction.guildId, negAmount);
			await interaction.reply({
				content: `${interaction.member} you now have ${userBP.amount} coins.\n${member} you now have ${memberBP.amount} coins.`,
				ephemeral: false
			});
		} else if (interaction.options.getSubcommand() === 'balance') {
			pass
		} else if (interaction.options.getSubcommand() === 'set') {
			if (!interaction.member.permissions.has("ADMINISTRATOR")) {
				await interaction.reply({
					content: `${interaction.member} you do not have permission to do this.`,
					ephemeral: true
				});
				return;
			}
			const member = interaction.options.getUser('member');
			let amount = interaction.options.getInteger('amount');
			let memberBP = await balanceAdd(member.id, interaction.guildId);
			amount = amount - memberBP.amount
			memberBP = await balanceAdd(member.id, interaction.guildId, amount);
			await interaction.reply({
				content: `${member} you now have ${memberBP.amount} coins.`,
				ephemeral: false
			});
		} else if (interaction.options.getSubcommand() === 'daily') {
			await interaction.reply({
				content: `${interaction.member} This doesn't exist yet.`,
				ephemeral: true
			});
		} else {
			await interaction.reply({
				content: 'No subcommand selected.',
				ephemeral: true
			});
		}
		async function balanceAdd(userId, guildId, amount = 0) {
			let user = await balance.findOne({ userId: userId, guildId: guildId })
			if (!user) {
				user = await new balance({
					_id: mongoose.Types.ObjectId(),
					userId: userId,
					guildId: guildId,
				});
			};
			await user.save().catch(err => console.log(err));
			if (amount) {
				user = await balance.findOneAndUpdate({ userId: userId, guildId: guildId },
					{ amount: user.amount + amount },
					{ new: true });
			};
			return user;
		};
	},
};