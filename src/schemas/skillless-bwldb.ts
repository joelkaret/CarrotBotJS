import mongoose from "mongoose";

mongoose.set("strictQuery", false);

interface ISBLSchema {
	_id: mongoose.Types.ObjectId;
	uuid: string;
	ign: string;
	winstreak: number;
	mode: string;
}

const SBL_Schema = new mongoose.Schema<ISBLSchema>({
	_id: mongoose.Schema.Types.ObjectId,
	uuid: String,
	ign: String,
	winstreak: Number,
	mode: String,
});

export default mongoose.model<ISBLSchema>(
	"sbl",
	SBL_Schema,
	"skillless_bw_ldb"
);
