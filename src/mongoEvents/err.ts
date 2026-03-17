import log from "../utils/logger";

export default {
	name: "err",
	execute(error: Error) {
		log.error("MongoDB error:", error);
	},
};
