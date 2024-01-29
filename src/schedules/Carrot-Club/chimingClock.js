const schedule = require("node-schedule");

const carrotClubId = "835942211635773472";
const channelId = "835963832718590023";
const rule = new schedule.RecurrenceRule();
rule.minute = 0;

module.exports = (client) => {
	schedule.scheduleJob(rule, function () {
		const carrotClub = client.guilds.cache.get(carrotClubId);
		let channel = carrotClub.channels.cache.find((C) => C.id == channelId);
		if (channel) {
			channel.send("Ding Dong!");
		}
	});
};
