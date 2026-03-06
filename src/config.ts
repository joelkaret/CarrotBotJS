const CARROT_CLUB_GUILD_ID = "835942211635773472";
const CARROT_CLUB_PAINTBALL_CHANNEL_ID = "1388992189941682256";

const PAINTBALL_ROLE_NAME = "Paintball";
const PAINTBALL_NUM_TO_ALERT = 12;
const PAINTBALL_FILE = "paintballPlayerCountsData.json";
const PAINTBALL_MINUTES_BETWEEN_ALERTS = 30;

const SKILLESS_GUILD_ID = "713646548436910116";
const SKILLESS_GENERAL_CHANNEL_ID = "759265396901150761";

const WALTER_WEDNESDAY_VIDEO_URL =
	"https://cdn.discordapp.com/attachments/852716030601330740/1190718826766143520/walter_wedsendy.mp4?ex=65a2d252&is=65905d52&hm=ad65957d76fec08992c35123391585335b9e8daeebad755cd475faa79273e9bb&";
const WHITE_CIRCLE_EMOJI = "⚪";

export interface PaintballConfig {
	guildId: string;
	channelId: string;
	roleName: string;
	numToAlert: number;
	minutesBetweenAlerts: number;
	reactionEmoji: string;
	fileName: string;
}

export interface WalterWednesdayConfig {
	guildId: string;
	channelId: string;
	rule: {
		dayOfWeek: number;
		hour: number;
		minute: number;
		tz: string;
	};
	url: string;
}

export interface Config {
	paintball: PaintballConfig;
	walterWednesday: WalterWednesdayConfig;
	userIds: {
		botOwner: string;
	};
	bedwarsLeaderboard: {
		roleName: string;
	};
	bot: {
		activityName: string;
	};
}

const config: Config = {
	paintball: {
		guildId: CARROT_CLUB_GUILD_ID,
		channelId: CARROT_CLUB_PAINTBALL_CHANNEL_ID,
		roleName: PAINTBALL_ROLE_NAME,
		numToAlert: PAINTBALL_NUM_TO_ALERT,
		minutesBetweenAlerts: PAINTBALL_MINUTES_BETWEEN_ALERTS,
		reactionEmoji: WHITE_CIRCLE_EMOJI,
		fileName: PAINTBALL_FILE,
	},
	walterWednesday: {
		guildId: SKILLESS_GUILD_ID,
		channelId: SKILLESS_GENERAL_CHANNEL_ID,
		rule: {
			dayOfWeek: 3, // Wednesday
			hour: 12, // 12 PM
			minute: 0, // 0 minutes
			tz: "America/Atikokan", // EST
		},
		url: WALTER_WEDNESDAY_VIDEO_URL,
	},
	userIds: {
		botOwner: "506884005195677696",
	},
	bedwarsLeaderboard: {
		roleName: "Guild Staff",
	},
	bot: {
		// Playing:
		activityName: "with carrots 🥕",
	},
};

export default config;
