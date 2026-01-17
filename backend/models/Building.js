import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: true,
			required: true,
		},
		orderedItems: [
			{
				desc: { type: String, required: true },
				orderOption: String,
				orderDate: String,
			},
		],
	},
	{ timestamps: true },
);

const Building = mongoose.model("Building", buildingSchema);

export default Building;
