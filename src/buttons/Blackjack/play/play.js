const Canvas = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');
const balance = require('../../../schemas/balance');
const backgroundFilename = 'darkGreen.png'


module.exports = {
	data: {
		name: 'play'
	},
	async execute(interaction, client) {
		interaction.deferUpdate();
		const tempComponents = interaction.message.components
		const totalString = interaction.message.content
		// let tempEmbed = interaction.message.embeds[0]
		// let cardsString  = tempEmbed.fields[2].value
		const stringArray = totalString.split('/')
		// stringArray[0-3] == rando http shit
		// stringArray[5]] == rando .com shit
		const cardsString = stringArray[2].substring(9)
		const numCardsUsed = parseInt(stringArray[3])
		const hexOrder = stringArray[4]
		const binaryOrder = parseInt(hexOrder, 16).toString(2)
		const startCard = parseInt(stringArray[5])
		const userId = stringArray[6]
		const currentBet = stringArray[7]
		console.log(`Cards: ${cardsString}`)
		console.log(`Number of cards used: ${numCardsUsed}`)
		console.log(`Hex Order: ${hexOrder}`)
		console.log(`Binary Order: ${binaryOrder}`)
		console.log(`Start Card: ${startCard}`)
		console.log(`User id: ${userId}`)
		console.log(`Current Bet: ${currentBet}`)
		if (interaction.user.id !== userId) {
			await interaction.reply({ content: `${interaction.member} This is not your game of blackjack!`, ephemeral: true })
			return;
		}
		let text = ''
		let cards = []
		for (let i = 0; i < 52; i++) {
			cards[i] = cardsString.substr(i * 2, 2)
		}
		let dealerHand = [cards[startCard], cards[startCard + 2]]
		let playerHand = [cards[startCard + 1], cards[startCard + 3]]

		// Image
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

		// cards
		const card1 = new Canvas.Image();
		card1.src = await readFile(`src/images/Deck-Of-Cards/${dealerHand[0]}.png`)
		context.drawImage(card1, 25, 100, 244, 333) // dealer's cards
		const card2 = new Canvas.Image();
		card2.src = await readFile(`src/images/Deck-Of-Cards/back.png`)
		context.drawImage(card2, 25 + 250, 100, 244, 333) // dealer's hidden card

		// naturals
		let playerValue = 0
		let dealerValue = 0
		let tens = ['T', 'J', 'Q', 'K']
		for (let i = 0; i < 2; i++) {
			if (tens.includes(playerHand[i].charAt(0))) {
				playerValue = playerValue + 10
			} else if (playerHand[i].charAt(0) == 'A') {
				playerValue = playerValue + 11
			} else {
				playerValue = playerValue + parseInt(playerHand[i].charAt(0))
			}
		}
		for (let i = 0; i < 2; i++) {
			if (tens.includes(dealerHand[i].charAt(0))) {
				dealerValue = dealerValue + 10
			} else if (dealerHand[i].charAt(0) == 'A') {
				dealerValue = dealerValue + 11
			} else {
				dealerValue = dealerValue + parseInt(dealerHand[i].charAt(0))
			}
		}
		if (playerValue == 21 && dealerValue !== 21) {
			let payment = 1.5 * currentBet
			text = `Player has a Blackjack! Paid ${payment}`
			await balanceAdd(userId, interaction.guildId, payment)
		}

		for (let i = 0; i < dealerHand.length; i++) {
			const card = new Canvas.Image();
			card.src = await readFile(`src/images/Deck-Of-Cards/${playerHand[i]}.png`)
			context.drawImage(card, 25 + 250 * i, 525, 244, 333) // player's cards
		}

		// Text
		context.font = '60px sans-serif';
		context.fillStyle = '#ffffff';
		context.fillText("Dealer's Hand", 25, 75);
		context.fillText("Player's Hand", 25, 500);
		context.fillText(`Bet: ${currentBet}`, 25, 920);
		context.fillText(`${text}`, 25, 980);
		const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'profile-image.png');

		
		// 
		// const dealerHand = [cards[1], cards[3]]
		// const playerHand = [cards[0], cards[2]]
		// cards.splice(0,4)
		// tempEmbed.fields[0] = 
		// tempEmbed.fields[1] = 
		// tempEmbed.fields[2] = 
		await interaction.message.edit({
			content: `[\u200B](https://${stringArray[2]}/${numCardsUsed}/${hexOrder}/${startCard}/${userId}/${currentBet}/)`,
			components: tempComponents,
			files: [attachment],
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
	}
};