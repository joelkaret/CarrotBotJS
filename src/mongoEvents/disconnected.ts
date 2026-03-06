import { cyanBright, gray } from "colorette";

export default {
	name: "disconnected",
	execute() {
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Disconnected from Database.")}`
		);
	},
};
