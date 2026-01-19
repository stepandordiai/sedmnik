import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		plan: [
			{
				task: {
					type: String,
				},
				priority: String,
			},
		],
	},
	{ timestamps: true },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
