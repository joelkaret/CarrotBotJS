const fs = require("fs");

module.exports = (client) => {
	client.handleButtons = async () => {
		const buttonFolders = fs.readdirSync("./src/buttons");
		for (const folder of buttonFolders) {
			const subFolders = fs.readdirSync(`./src/buttons/${folder}`);
			for (const subFolder of subFolders) {
				const buttonFiles = fs.readdirSync(`./src/buttons/${folder}/${subFolder}`).filter(file => file.endsWith(".js"));
				for (const file of buttonFiles) {
					const button = require(`../buttons/${folder}/${subFolder}/${file}`);
					client.buttons.set(button.data.name, button);
				}
			}
		}
	}
}