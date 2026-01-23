import express from "express";
import Building from "../models/Building.js";
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

export default router;
