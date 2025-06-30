require("dotenv").config();
const fs = require("node:fs");

const clientId = process.env.clientId;
const config = require("../config.js");
const paintballRoleName = config.paintball.roleName;
const paintballReactionEmoji = config.paintball.reactionEmoji;

module.exports = {
    name: "messageReactionRemove",
    once: false,
    async execute(reaction, user, client) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error(
                    "Something went wrong when fetching the message:",
                    error
                );
                return;
            }
        }
        const member = reaction.message.guild.members.cache.get(user.id);
        if (user.id == clientId) return;

        const paintballDataFile = "src/paintballPlayerCountsData.json";
        let paintballData = {};
        try {
            paintballData = JSON.parse(
                fs.readFileSync(paintballDataFile, {
                    encoding: "utf8",
                    flag: "r",
                })
            );
        } catch (error) {
            console.error("Error reading file: ", error);
            paintballData = {
                lastPaintballPlayerCount: -1,
                lastPaintballPlayerMessageId: "",
                lastTimeSeenPb: "Never",
                lastTimePinged: "Never",
                maxPbPlayerCount: 0,
            };
        }
        if (reaction.message.id == paintballData.lastPaintballPlayerMessageId) {
            if (reaction.emoji.toString() == paintballReactionEmoji) {
                const role = reaction.message.guild.roles.cache.find((r) => r.name === paintballRoleName)
                member.roles.remove(role)
            }
        }
    },
};
