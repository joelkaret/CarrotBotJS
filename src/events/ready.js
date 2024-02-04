const { cyanBright, gray } = require("colorette");

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Ready! Logged in as " + client.user.tag)}`
		);
	},
};