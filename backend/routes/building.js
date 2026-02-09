import express from "express";
import Building from "../models/Building.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.put("/:id/ordered-items", protect, async (req, res) => {
	try {
		const { id } = req.params;

		const orderedItemsArray = Array.isArray(req.body) ? req.body : [];

		const sanitized = orderedItemsArray
			.filter((item) => item?.desc && item.desc.trim() !== "")
			.map((item) => ({
				desc: item.desc.trim(),
				orderOption: item.orderOption || "",
				orderDate: item.orderDate || "",
			}));

		const building = await Building.findById(id);

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

router.get("/:id/ordered-items", protect, async (req, res) => {
	try {
		const { id } = req.params;

		const building = await Building.findById(id);

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

router.put("/:id/work-schedule", protect, async (req, res) => {
	try {
		const { id } = req.params;
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

		const building = await Building.findById(id);

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

router.get("/:id/work-schedule", protect, async (req, res) => {
	try {
		const { id } = req.params;

		const building = await Building.findById(id);

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

export default router;
