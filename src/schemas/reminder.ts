import mongoose from "mongoose";

export interface IReminder {
	_id: mongoose.Types.ObjectId;
	userId: string;
	guildId: string;
	channelId: string;
	message: string;
	triggerAt: Date;
	createdAt: Date;
	allowedMentions: {
		everyone: boolean;
		roles: string[];
	};
}

const Reminder_Schema = new mongoose.Schema<IReminder>({
	_id: mongoose.Schema.Types.ObjectId,
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	channelId: { type: String, required: true },
	message: { type: String, required: true },
	triggerAt: { type: Date, required: true },
	createdAt: { type: Date, required: true },
	allowedMentions: {
		everyone: { type: Boolean, default: false },
		roles: { type: [String], default: [] },
	},
});

export default mongoose.model<IReminder>(
	"reminder",
	Reminder_Schema,
	"reminders"
);
