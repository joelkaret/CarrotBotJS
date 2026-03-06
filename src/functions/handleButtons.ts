import type { Client } from "discord.js";
import type { ButtonData } from "../types/bot.js";
import * as buttons from "../buttons/index.js";

export default (client: Client) => {
	client.handleButtons = () => {
		for (const button of Object.values(buttons) as ButtonData[]) {
			client.buttons.set(button.data.name, button);
		}
	};
};
