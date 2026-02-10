import express from "express";
import Lead from "./../models/Lead.js";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const { tel } = req.body;

		if (tel.trim() === "" || tel.length < 9) {
			return res.status(400).json({ message: "Telephone number is required" });
		}

		const newLead = await Lead.create({ tel });

		res.status(201).json(newLead);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to create lead" });
	}
});

router.put("/", async (req, res) => {
	try {
		const leads = req.body;

		const validData = leads.filter(
			(lead) => lead.tel && lead.tel.trim() !== "",
		);

		// if (validData === 0) {
		// 	return res.status(400).json({ message: "Telefon je povinné pole" });
		// }

		await Lead.deleteMany({});
		const newLeads = await Lead.insertMany(validData);

		res.status(200).json(newLeads);
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
