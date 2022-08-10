const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionResponseType } = require('discord-api-types/v10');
const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment} = require('discord.js');
const balance = require('../../schemas/balance.js')
const mongoose = require('mongoose');
const Canvas = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const backgroundFilename = 'darkGreen.png'

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
				.setDescription('Play a game.')
				.addIntegerOption(option =>
					option.setName('bet')
						.setDescription('The amount you want to bet.')
						.setRequired(true)))
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
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rules')
				.setDescription('Display the rules of Blackjack.')),
	async execute(interaction, client) {
		if (interaction.options.getSubcommand() === 'balance') {
			const userBP = await balanceAdd(interaction.user.id, interaction.guildId);
			await interaction.reply({
				content: `You have ${userBP.amount} coins.`,
				ephemeral: false
			});
			return;
		};
		if (interaction.options.getSubcommand() === 'play') {
			await interaction.deferReply({ ephemeral: false })
			const row1 = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('play')
					.setLabel('Play')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('quit')
					.setLabel('Quit')
					.setStyle('DANGER'),
			);
			const row2 = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('hit')
					.setLabel('Hit')
					.setStyle('SUCCESS')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('stand')
					.setLabel('Stand')
					.setStyle('DANGER')
					.setDisabled(true),
			);
			const row3 = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('split')
					.setLabel('Split')
					.setStyle('PRIMARY')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('doubleDown')
					.setLabel('Double Down')
					.setStyle('PRIMARY')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('insurance')
					.setLabel('Insurance')
					.setStyle('PRIMARY')
					.setDisabled(true),
			);
			const bet = interaction.options.getInteger('bet');
			const name = interaction.member.nickname ? interaction.member.nickname : interaction.user.username
			const cards = ['AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
				'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
				'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
				'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH']
			shuffleArray(cards)
			let cardsString
			for (let i = 0; i < 52; i++) {
				cardsString = cardsString + cards[i]
			}
			cardsString = `${cardsString}/0/5000000000000/0/${interaction.user.id}/${bet}/` // 13 0's hex, each represents 4 cards. 0 is for dealer, 1 is for player.

			// Create Canvas
			const canvas = Canvas.createCanvas(2000, 1000);
			const context = canvas.getContext('2d');
			// With a background
			const backgroundFile = await readFile(`src/images/${backgroundFilename}`);
			const background = new Canvas.Image();
			background.src = backgroundFile;
			context.drawImage(background, 0, 0, canvas.width, canvas.height); // background

			// Border
			context.strokeStyle = '#0099ff';
			context.strokeRect(0, 0, canvas.width, canvas.height);

			// cards demo
			const card1 = new Canvas.Image();
			card1.src = await readFile('src/images/Deck-Of-Cards/back.png')
			context.drawImage(card1, 25, 100, 244, 333) // dealer first
			const card2 = new Canvas.Image();
			card2.src = await readFile('src/images/Deck-Of-Cards/back.png')
			context.drawImage(card2, 275, 100, 244, 333) // dealer second
			const card3 = new Canvas.Image();
			card3.src = await readFile('src/images/Deck-Of-Cards/back.png')
			context.drawImage(card3, 25, 525, 244, 333) // player first
			const card4 = new Canvas.Image();
			card4.src = await readFile('src/images/Deck-Of-Cards/back.png')
			context.drawImage(card4, 275, 525, 244, 333) // player second

			// Text
			context.font = '60px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText("Dealer's Hand", 25, 75);
			context.fillText("Player's Hand", 25, 500);
			context.fillText(`Bet: ${bet}`, 25, 960);

			const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'profile-image.png');
			// const embed = new MessageEmbed()
			// 	.setColor('#FF0000')
			// 	.setAuthor({ name: `${interaction.user.tag}'s Blackjack Game.`, iconURL: interaction.user.displayAvatarURL() })
			// 	.setThumbnail(client.user.displayAvatarURL())
			// 	.setDescription(`${interaction.user}, Bet: ${bet}`)
			// 	.addFields(
			// 		{ name: "Dealer's Hand", value: `\u200B`, inline: false },
			// 		{ name: `${name}'s Hand`, value: `\u200B`, inline: false },
			// 		{ name: `\u200B`, value: `[\u200B](https://${cardsString}})`, inline: true },
			// 	)
			// 	.setTimestamp()
			// 	.setFooter({ text: 'temp' })
			await interaction.editReply({
				// embeds: [embed],
				content: `[\u200B](https://${cardsString})`,
				components: [row1, row2, row3],
				files: [attachment]
			});
			return;
		};
		if (interaction.options.getSubcommand() === 'donate') {
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
			return;
		};
		if (interaction.options.getSubcommand() === 'set') {
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
			return;
		};
		if (interaction.options.getSubcommand() === 'daily') {
			await interaction.reply({
				content: `${interaction.member} This doesn't exist yet.`,
				ephemeral: true
			});
			return;
		};
		if (interaction.options.getSubcommand() === 'rules') {
			await interaction.reply({
				content: `${interaction.member} This doesn't exist yet.`,
				ephemeral: true
			});
			return;
		};
		//else:
		await interaction.reply({
			content: 'No subcommand selected.',
			ephemeral: true
		});
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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    };
};