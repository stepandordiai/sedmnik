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

router.put("/:buildingId/ordered-items", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;

		const orderedItemsArray = Array.isArray(req.body) ? req.body : [];

		const sanitized = orderedItemsArray
			.filter((item) => item?.desc && item.desc.trim() !== "")
			.map((item) => ({
				desc: item.desc.trim(),
				orderOption: item.orderOption || "",
				orderDate: item.orderDate || "",
			}));

		const building = await Building.findById(buildingId);

		if (!building) {
			return res.status(404).json({
				message: "Building not found",
			});
		}

		building.orderedItems = sanitized;
		await building.save();

		res.status(200).json(building.orderedItems);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Chyba při ukládání objednanich materialu" });
	}
});

router.get("/:buildingId/ordered-items", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;

		const building = await Building.findById(buildingId);

		if (!building) {
			return res.status(404).json({
				message: "Building not found",
			});
		}

		res.status(200).json(building.orderedItems);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Chyba při ukládání objednanich materialu" });
	}
});

//

router.put("/:buildingId/work-schedule", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;
		const workScheduleArray = req.body;

		if (!Array.isArray(workScheduleArray)) {
			return res.status(400).json({ message: "Invalid workSchedule format" });
		}

		const sanitized = workScheduleArray
			.map((item) => ({
				desc: item.desc.trim(),
				start: item.start || "",
				finish: item.finish || "",
				comment: item.comment || "",
			}))
			.filter((item) => item.desc);

		const building = await Building.findById(buildingId);

		if (!building) {
			return res.status(404).json({
				message: "Building not found",
			});
		}

		building.workSchedule = sanitized;
		await building.save();

		res.status(200).json({
			workSchedule: building.workSchedule,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Chyba při ukládání objednanich materialu" });
	}
});

router.get("/:buildingId/work-schedule", protect, async (req, res) => {
	try {
		const { buildingId } = req.params;

		const building = await Building.findById(buildingId);

		if (!building) {
			return res.status(404).json({
				message: "Building not found",
			});
		}

		res.status(200).json(building.workSchedule);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Chyba při ukládání objednanich materialu" });
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
			id: comment._id,
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
			id: comment._id,
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

// TODO: LEARN THIS
router.delete("/:buildingId/comments/:commentId", protect, async (req, res) => {
	try {
		const { buildingId, commentId } = req.params;

		const comment = await Comment.findOneAndDelete({
			_id: commentId,
			buildingId: buildingId,
		});

		if (!comment) {
			return res.status(404).json({
				message: "Comment not found for this building",
			});
		}

		// TODO: 204?
		return res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
