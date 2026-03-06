import fs from "fs";
import type { Client } from "discord.js";
import type { ButtonData } from "../types/bot.js";

export default (client: Client) => {
	client.handleButtons = async () => {
		const buttonFolders = fs.readdirSync("./src/buttons");
		for (const folder of buttonFolders) {
			const subFolders = fs.readdirSync(`./src/buttons/${folder}`);
			for (const subFolder of subFolders) {
				const buttonFiles = fs
					.readdirSync(`./src/buttons/${folder}/${subFolder}`)
					.filter((file) => file.endsWith(".ts"));
				for (const file of buttonFiles) {
					const buttonModule = (await import(
						`../buttons/${folder}/${subFolder}/${file}`
					)) as { default: ButtonData };
					const button = buttonModule.default;
					client.buttons.set(button.data.name, button);
				}
			}
		}
	};
};
