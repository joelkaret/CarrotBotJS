const fs = require("fs");
const { cyanBright, gray } = require("colorette");

module.exports = (client) => {
	client.handleSchedules = async () => {
		const scheduleFolders = fs.readdirSync("./src/schedules");
		for (const folder of scheduleFolders) {
			const scheduleFiles = fs
				.readdirSync(`./src/schedules/${folder}`)
				.filter((file) => file.endsWith(".js"));
			for (const file of scheduleFiles) {
				const schedule = require(`../schedules/${folder}/${file}`);
				try {
					schedule(client);
					console.log(
						`[${cyanBright("DEBUG")}] ${gray(
							"Schedule deployed successfully"
						)}`
					);
				} catch (error) {
					console.log(`[${cyanBright("DEBUG")}] ${gray(error)}\n`);
				}
			}
		}
	};
};
