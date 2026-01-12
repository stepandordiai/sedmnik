import WorkShift from "../models/Work.js";
import { protect } from "../middleware/auth.js";
import express from "express";
import Plan from "../models/Plan.js";

const router = express.Router();

router.post("/responsibilities/plan", protect, async (req, res) => {
	try {
		const { task, executor, priority } = req.body;

		const plan = await Plan.findOne([], task, executor, priority, {
			new: true,
			upsert: true,
		});

		if (plan) {
		}

		res.status(200).json(plan);
	} catch (error) {}
});

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

router.get("/responsibilities/week", protect, async (req, res) => {
	try {
		const userId = req.query.userId || req.user._id;
		let { dates } = req.query;

		// 🔹 Normalize dates to array
		if (!dates) {
			return res.status(400).json({ message: "dates are required" });
		}

		// Normalize to array (Express might return a string if only 1 date is sent)
		const dateArray = Array.isArray(dates) ? dates : [dates];

		// 1. Prepare the structure for all requested dates
		let daysMap = dateArray.map((date) => ({ date, responsibilities: [] }));

		// 2. Fetch only the shifts that exist in DB
		const existingShifts = await WorkShift.find({
			user: userId,
			date: { $in: dateArray },
		});

		// 3. Merge DB data into our daysMap
		existingShifts.forEach((shift) => {
			const dayEntry = daysMap.find((d) => d.date === shift.date);
			if (dayEntry) {
				dayEntry.responsibilities = shift.responsibilities || [];
			}
		});

		// 🔹 FIX: Return 'daysMap', not '[workShift]'
		res.status(200).json(daysMap);
	} catch (err) {
		console.error("Error in /responsibilities/week:", err);
		res.status(500).json({ message: "Server error" });
	}
});

router.put("/responsibilities/week", protect, async (req, res) => {
	try {
		const { weekList } = req.body; // frontend sends [{ date, responsibilities: [...] }]
		const userId = req.user._id;

		if (!Array.isArray(weekList)) {
			return res.status(400).json({ message: "Invalid weekList format" });
		}

		const updatedShifts = [];

		for (const day of weekList) {
			const date = day.date;
			if (!date) continue; // skip invalid entries

			// sanitize responsibilities: remove empty tasks
			const sanitized = (day.responsibilities || [])
				.map((r) => ({
					task: (r.task || "").trim(),
					time: r.time || "",
				}))
				.filter((r) => r.task); // keep only non-empty tasks

			// check if shift exists
			let shift = await WorkShift.findOne({ user: userId, date });

			if (shift) {
				// update existing
				shift.responsibilities = sanitized;
				await shift.save();
			} else {
				// create new
				shift = await WorkShift.create({
					user: userId,
					date,
					responsibilities: sanitized,
				});
			}

			updatedShifts.push({
				date,
				responsibilities: shift.responsibilities,
			});
		}

		res.status(200).json({ week: updatedShifts });
	} catch (err) {
		console.error("Error updating week responsibilities:", err);
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

//

export default router;
