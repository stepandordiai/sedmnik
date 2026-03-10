import express from "express";
import { protect } from "../middleware/auth.js";
import Tool from "./../models/Tool.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
	try {
		const tool = req.body;

		if (!tool.name || tool.name.trim() === "") {
			return res.status(400).json({ message: "Name is required" });
		}

		const newTool = await Tool.create(tool);

		// TODO: 201 Created
		res.status(201).json(newTool);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.delete("/:id", protect, async (req, res) => {
	try {
		const { id } = req.params;

		const deletedTool = await Tool.findByIdAndDelete(id);

		if (!deletedTool) {
			return res.status(404).json({ message: "Tool not found" });
		}

		res.status(200).json(deletedTool);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.put("/:id", protect, async (req, res) => {
	try {
		const { id } = req.params;
		const tool = req.body;

		if (!tool.name || tool.name.trim() === "") {
			return res.status(400).json({ message: "Name is required" });
		}

		// TODO: learn this
		const updatedTool = await Tool.findByIdAndUpdate(id, tool, {
			new: true,
			runValidators: true,
		});

		if (!updatedTool) {
			return res.status(404).json({ message: "Tool not found" });
		}

		res.status(200).json(updatedTool);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.get("/all", protect, async (req, res) => {
	try {
		const tools = await Tool.find({});

		res.status(200).json(tools);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
