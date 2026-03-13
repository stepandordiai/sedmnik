import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
	{
		code: {
			type: String,
		},
		name: {
			type: String,
			required: true,
		},
		qty: {
			type: Number,
		},
		storageQty: {
			type: Number,
		},
		status: {
			type: String,
		},
		building: [
			{
				name: {
					type: String,
				},
				qty: {
					type: Number,
				},
			},
		],
		desc: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Tool = mongoose.model("Tool", toolSchema);

export default Tool;
