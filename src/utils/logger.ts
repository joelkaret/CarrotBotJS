import {
	cyanBright,
	greenBright,
	yellowBright,
	redBright,
	gray,
} from "colorette";

/**
 * Centralized logging utility for consistent, colored console output
 */

const debug = (message: string): void => {
	console.log(`[${cyanBright("DEBUG")}] ${gray(message)}`);
};

const info = (message: string): void => {
	console.log(`[${greenBright("INFO")}] ${message}`);
};

const warn = (message: string): void => {
	console.warn(`[${yellowBright("WARN")}] ${message}`);
};

const error = (message: string, err?: unknown): void => {
	console.error(`[${redBright("ERROR")}] ${message}`);
	if (err) {
		console.error(err);
	}
};

const success = (message: string): void => {
	console.log(`[${greenBright("SUCCESS")}] ${message}`);
};

const log = {
	debug,
	info,
	warn,
	error,
	success,
};

export default log;
