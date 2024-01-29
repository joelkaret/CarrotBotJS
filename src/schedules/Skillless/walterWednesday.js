const schedule = require("node-schedule");

const skilllessGuildId = "713646548436910116";
const channelId = "759265396901150761";
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = 3;
rule.hour = 12;
rule.minute = 0;
rule.tz = "America/Atikokan"; // EST

module.exports = (client) => {
	schedule.scheduleJob(rule, function () {
		const skilllessGuild = client.guilds.cache.get(skilllessGuildId);
		let channel = skilllessGuild.channels.cache.find(
			(C) => C.id == channelId
		);
		if (channel) {
			channel.send(
				"https://cdn.discordapp.com/attachments/852716030601330740/1190718826766143520/walter_wedsendy.mp4?ex=65a2d252&is=65905d52&hm=ad65957d76fec08992c35123391585335b9e8daeebad755cd475faa79273e9bb&"
			);
		}
	});
};
