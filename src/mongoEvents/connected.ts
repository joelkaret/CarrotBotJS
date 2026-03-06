import { cyanBright, gray } from "colorette";

export default {
	name: "connected",
	execute() {
		console.log(
			`[${cyanBright("DEBUG")}] ${gray("Connected to Database.")}`
		);
	},
};
