import log from "../utils/logger";

export default {
	name: "disconnected",
	execute() {
		log.debug("Disconnected from Database.");
	},
};
