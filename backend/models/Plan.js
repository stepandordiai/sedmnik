import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		task: {
			type: String,
			required: false,
		},

		executor: {
			type: String,
			required: false,
		},
		priority: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
