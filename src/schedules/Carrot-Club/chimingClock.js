const schedule = require("node-schedule");
const fs = require("node:fs");

const carrotClubId = "835942211635773472";
const channelId = "835963832718590023";
const rule = new schedule.RecurrenceRule();
rule.minute = 0;

module.exports = (client) => {
	schedule.scheduleJob(rule, async function () {
		const carrotClub = client.guilds.cache.get(carrotClubId);
		let channel = carrotClub.channels.cache.find((C) => C.id == channelId);
		if (channel) {
			const messageId = await channel.send("Ding Dong!");
			fs.writeFile("dinoReacted.txt", `${messageId}`, (err) => {
				if (err) throw err;
			});
			fs.writeFile("dinoReacted.txt", "false", (err) => {
				if (err) throw err;
			});
		}
	});
};
