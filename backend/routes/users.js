import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
	res.status(200).json(req.user);
});

router.get("/all", protect, async (req, res) => {
	try {
		// Find all users but don't send their passwords!
		const users = await User.find({}).select("-password");
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch users" });
	}
});

export default router;
