import WorkShift from "../models/Work.js";
import { protect } from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.post("/", protect, async (req, res) => {
	try {
		const { date, startTime, endTime, pauseTime } = req.body;
		if (!date) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const workShiftExists = await WorkShift.findOne({
			user: req.user._id,
			date,
		});

		if (workShiftExists) {
			workShiftExists.startTime = startTime;
			workShiftExists.endTime = endTime;
			workShiftExists.pauseTime = pauseTime;

			await workShiftExists.save();
			return res.status(200).json(workShiftExists);
		}

		// Otherwise, create new entry
		const newWorkShift = await WorkShift.create({
			user: req.user._id,
			date,
			startTime,
			endTime,
			pauseTime,
		});

		res.status(201).json(newWorkShift);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

router.get("/:date", protect, async (req, res) => {
	try {
		const date = req.params.date;
		const userId = req.query.userId || req.user._id; // use query if provided
		let workShift = await WorkShift.findOne({
			user: userId,
			date,
		});

		if (!workShift) {
			// Return default object with empty times
			workShift = {
				user: userId,
				date,
				startTime: "",
				endTime: "",
				pauseTime: "",
			};
		}

		res.status(200).json(workShift);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// GET responsibilities
router.get("/responsibilities/:date", protect, async (req, res) => {
	try {
		const date = req.params.date;
		const userId = req.query.userId || req.user._id; // use query if provided
		const shift = await WorkShift.findOne({ user: userId, date });
		const responsibilities = shift?.responsibilities || [];

		res.status(200).json({ responsibilities });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// PUT responsibilities
router.put("/responsibilities/:date", protect, async (req, res) => {
	try {
		const { responsibilities } = req.body;
		const userId = req.user._id;
		const date = req.params.date;

		if (!Array.isArray(responsibilities)) {
			return res
				.status(400)
				.json({ message: "Invalid responsibilities format" });
		}

		const sanitized = responsibilities
			.map((item) => ({
				task: item.task.trim(),
				time: item.time,
			}))
			.filter((item) => item.task);

		let shift = await WorkShift.findOne({ user: userId, date });

		if (!shift) {
			shift = await WorkShift.create({
				user: userId,
				date,
				responsibilities: sanitized,
			});
		} else {
			shift.responsibilities = sanitized;
			await shift.save();
		}

		res.status(200).json({ responsibilities: shift.responsibilities });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
