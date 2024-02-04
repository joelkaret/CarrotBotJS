module.exports = {
	name: 'disconnected',
	execute() {
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Disconnected from Database.")}`
		);
	},
};