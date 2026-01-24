import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		buildingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Building",
			required: true,
		},
		name: { type: String, required: true },
		text: { type: String, required: true },
		color: {
			r: Number,
			g: Number,
			b: Number,
		},
	},
	{ timestamps: true },
);

export default mongoose.model("Comment", commentSchema);
