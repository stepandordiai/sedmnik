import express from "express";
import Lead from "./../models/Lead.js";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const lead = req.body;

		if (!lead.tel || lead.tel.trim() === "") {
			return res.status(400).json({ message: "Telefon je povinné pole" });
		}

		const newLead = await Lead.create(lead);

		res.status(201).json(newLead);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.put("/", async (req, res) => {
	try {
		const leads = req.body;

		const validLeads = leads.filter(
			(lead) => lead.tel && lead.tel.trim() !== "",
		);

		await Lead.deleteMany({});

		const updatedLeads = await Lead.insertMany(validLeads);

		res.status(200).json(updatedLeads);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.get("/all", async (req, res) => {
	try {
		const leads = await Lead.find({});

		res.status(200).json(leads);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to find leads" });
	}
});

export default router;
