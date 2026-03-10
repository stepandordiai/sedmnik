import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		qty: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		building: {
			type: String,
		},
		desc: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Tool = mongoose.model("Tool", toolSchema);

export default Tool;
