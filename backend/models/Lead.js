import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
	{
		name: { type: String, required: false },
		tel: { type: String, required: true },
		address: { type: String, required: false },
		position: { type: String, required: false },
		details: { type: String, required: false },
	},
	{ timestamps: true },
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
