const {
	ToadScheduler,
	SimpleIntervalJob,
	AsyncTask,
} = require("toad-scheduler");
const { cyanBright, gray } = require("colorette");
const fs = require("node:fs");
const axios = require("axios");
const { userMention } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const guildId = "1288293666531577988";
const channelId = "1297000322853765210";
const hypixelApiKey = process.env.hypixelApiKey;

module.exports = (client) => {
	const scheduler = new ToadScheduler();
	const task = new AsyncTask(
		"paintballCounts",
		() => {
			const uri = `https://api.hypixel.net/v2/counts?key=${hypixelApiKey}`;
			return axios
				.get(uri)
				.then((result) => {
					const guild = client.guilds.cache.get(guildId);
					let channel = guild.channels.cache.find(
						(C) => C.id == channelId
					);
					const data = result.data;
					const games = data.games;
					const legacy = games.LEGACY;
					const legacyModes = legacy.modes;
					const paintball = Number(legacyModes.PAINTBALL);

					const lastPaintballPlayerCount = Number(
						fs.readFileSync("src/lastPaintballPlayerCount.txt", {
							encoding: "utf8",
							flag: "r",
						})
					);

					if (paintball === lastPaintballPlayerCount) return;

					const pbDifference = paintball - lastPaintballPlayerCount;
					const pbDifferenceString =
						pbDifference > 0
							? `+ ${pbDifference}`
							: `\\- ${pbDifference * -1}`;

					fs.writeFile(
						"src/lastPaintballPlayerCount.txt",
						String(paintball),
						(err) => {
							if (err) throw err;
						}
					);

					if (channel) {
						const embed = new EmbedBuilder()
							.setColor("#cfc2ff")
							.setAuthor({
								name: client.user.tag,
								iconURL: client.user.displayAvatarURL(),
							})
							.setTitle(`Paintball Player Count`)
							.addFields(
								{
									name: "Current player count:",
									value: String(paintball),
								},
								{
									name: "Difference from previous:",
									value: pbDifferenceString,
								}
							)
							.setTimestamp();

						channel.send({ embeds: [embed] });

						if (paintball >= 8) {
							const usersToBePingedId = ["506884005195677696", "209745206696738817", "381553734343196672"];
							for (let user of usersToBePingedId) {
								channel.send(userMention(user));
							}
						}
					}
				})
				.catch((err) => {
					console.log(`[${cyanBright("DEBUG")}] ${gray(err)}`);
				});
		},
		(err) => {
			console.log(`[${cyanBright("DEBUG")}] ${gray(err)}`);
		}
	);
	const job = new SimpleIntervalJob({ seconds: 10 }, task);
	scheduler.addSimpleIntervalJob(job);
};
