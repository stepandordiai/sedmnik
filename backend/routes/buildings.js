import express from "express";
import Building from "../models/Building.js";
import Comment from "../models/Comment.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Zadejte název stavby" });
		}

		const buildingExists = await Building.findOne({
			name,
		});

		if (buildingExists) {
			return res
				.status(400)
				.json({ message: "Entered building already exists" });
		}

		// Otherwise, create new entry
		const newBuilding = await Building.create({
			name,
		});

		res.status(201).json(newBuilding);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

router.get("/all", protect, async (req, res) => {
	try {
		const buildings = await Building.find({});

		res.status(200).json(buildings);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

router.post("/:buildingId/comments", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;
		const { name, text, color } = req.body;

		if (!name || !text) {
			return res.status(400).json({ message: "Zadejte název" });
		}

		const comment = await Comment.create({
			buildingId,
			name,
			text,
			color,
		});

		return res.status(201).json({
			name: comment.name,
			text: comment.text,
			createdAt: comment.createdAt,
			color: {
				r: comment.color.r,
				g: comment.color.g,
				b: comment.color.b,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

router.get("/:buildingId/comments", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;

		const comments = await Comment.find({ buildingId });

		const updated = comments.map((comment) => ({
			name: comment.name,
			text: comment.text,
			createdAt: comment.createdAt,
			color: {
				r: comment.color.r,
				g: comment.color.g,
				b: comment.color.b,
			},
		}));

		return res.json(updated);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
