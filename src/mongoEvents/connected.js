const { cyanBright, gray } = require("colorette");

module.exports = {
	name: "connected",
	execute() {
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Connected to Database.")}`
		);
	},
};
