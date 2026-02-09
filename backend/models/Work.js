import mongoose from "mongoose";

const workShiftSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		date: {
			type: String,
			required: true,
		},
		startTime: {
			type: String,
			required: false,
		},
		endTime: {
			type: String,
			required: false,
		},
		overTime: {
			type: String,
			required: false,
		},
		pauseTime: {
			type: String,
			required: false,
		},
		responsibilities: [
			{
				task: String,
				time: String,
			},
		],
	},
	{ timestamps: true },
);

const WorkShift = mongoose.model("WorkShift", workShiftSchema);

export default WorkShift;
