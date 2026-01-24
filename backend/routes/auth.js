import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
	try {
		const { name, username, password } = req.body;

		if (!name || !username || !password) {
			return res.status(400).json({ message: "Please fill all the fields" });
		}

		const userExists = await User.findOne({ username });
		if (userExists) {
			return res.status(400).json({ message: "Uživatelský účet již existuje" });
		}

		const randomBackground = () => {
			const r = Math.floor(Math.random() * 255);
			const g = Math.floor(Math.random() * 255);
			const b = Math.floor(Math.random() * 255);

			return { r, g, b };
		};

		const color = randomBackground();

		const user = await User.create({ name, username, password, color });
		if (user) {
			const token = generateToken(user._id);

			return res.status(201).json({
				_id: user._id,
				name: user.name,
				username: user.username,
				token,
				color: user.color,
			});
		}
	} catch (err) {
		console.error("REGISTER ERROR:", err.message);
		res.status(500).json({ message: err.message || "Server error" });
	}
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		if (!username || !password) {
			return res.status(400).json({ message: "Please fill all the fields" });
		}
		const user = await User.findOne({ username });

		if (!user || !(await user.matchPassword(password))) {
			return res
				.status(401)
				.json({ message: "Neplatné uživatelské jméno nebo heslo" });
		}

		// ✅ create color if missing
		const randomBackground = () => {
			const r = Math.floor(Math.random() * 255);
			const g = Math.floor(Math.random() * 255);
			const b = Math.floor(Math.random() * 255);
			return { r, g, b };
		};

		if (
			!user.color ||
			user.color.r == null ||
			user.color.g == null ||
			user.color.b == null
		) {
			user.color = randomBackground();
			await user.save();
		}

		const token = generateToken(user._id);
		res.status(200).json({
			_id: user._id,
			name: user.name, // ✅ add this
			username: user.username,
			token,
			color: user.color,
		});
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// Generate JWT token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;
