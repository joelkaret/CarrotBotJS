# CarrotBotJS

CarrotBotJS is a Discord bot built with Node.js and `discord.js`. It powers a mix of fun utilities, admin helpers, scheduled events, and integrations with MongoDB and the Hypixel API.

It is a personal bot consisting of features meant for me and friends - but could be useful for others.
It has a Hypixel Paintball discord pinger when player counts reach a certain level.
It has a Hypixel Bedwars winstreak leaderboard system (for the Skillless Guild).

## Overview

-   Bot commands organized by category (Admin, Fun, Skillless-Leaderboard)
-   Interactive components via buttons and reactions
-   Scheduled tasks (e.g., Walter Wednesday, Paintball player count)
-   MongoDB persistence (via `mongoose`)
-   External API integration (Hypixel)
-   Clean event handling for Discord interactions and message reactions

## Getting Started

### Prerequisites

-   Node.js and npm installed
-   A Discord application with a bot token
-   Optional: Access to a MongoDB instance

### Install

```powershell
# From the project root
npm install
```

### Run (local development)

```powershell
# Start the bot (uses the start script)
npm run start

# Or directly
node .\src\bot.js
```

## Configuration

The file `src/config.js` holds static IDs and feature settings used across the bot (schedules, reactions, roles). Update the IDs to match your server and channels.
These are not pieces of sensitive information, and the current config is set up for my usecase.

-   `paintball`: `guildId`, `channelId`, `roleName`, thresholds (`numToAlert`, `minutesBetweenAlerts`), data files
-   `walterWednesday`: `guildId`, `channelId`, schedule `rule` (day/hour/minute/tz), `url`
-   `userIds`, `bedwarsLeaderboard`: owner and role settings

Usage (relative path will vary by file location):

```js
const config = require("./src/config.js");
const guildId = config.walterWednesday.guildId;
```

## Environment Variables (.env)

Create a `.env` file in the project root. Example layout:

```env
# Discord bot token
token="aaaaaaaaa-11111-3333-444-2222222222"

# Comma-separated list of guild IDs (no spaces)
guildIds="guildId1,guildId2"

# MongoDB connection string
dbToken="mongodb+srv://bot:blah@blah-vlah.blah.mongodb.net/test?retryWrites=true&w=majority"

# Discord application client ID
clientId="clientId"

# Hypixel API key
hypixelApiKey="aaaaaaaaa-11111-3333-444-2222222222"
```

Notes:

-   Do not commit your `.env` file.
-   Ensure `guildIds` are comma-separated with no spaces.

## Useful Commands (Cheatsheet)

### Local Development (Windows PowerShell)

```powershell
# Install dependencies
npm install

# Start the bot
npm run start

# Run directly via Node
node .\src\bot.js
```

### Linux Service (production)

```bash
# View terminal logs for the service
sudo journalctl -u carrotbot -f

# Restart the bot service
sudo systemctl restart carrotbot
```

## Project Structure

```
src/
	bot.js                 # Bot entrypoint
	config.js              # Configuration helpers
	commands/              # Slash/message commands by category
	buttons/               # Button handlers (Fun, Skillless-Leaderboard)
	events/                # Discord event handlers (ready, interactions, reactions)
	functions/             # Shared utilities (db login, command/event routing, schedules)
	mongoEvents/           # MongoDB connection lifecycle handlers
	schedules/             # Scheduled jobs (Paintball, Walter Wednesday)
	schemas/               # Mongoose schemas (dino-ldb, skillless-bwldb)
logs/                    # Runtime logs
```
