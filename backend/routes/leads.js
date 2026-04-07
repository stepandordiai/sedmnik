import express from "express";
import Lead from "./../models/Lead.js";
import pushLeadToBitrix from "../utils/bitrix.js";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const lead = req.body;

		if (!lead.tel || lead.tel.trim() === "") {
			return res.status(400).json({ message: "Telefon je povinné pole" });
		}

		const newLead = await Lead.create(lead);

		// Push to Bitrix immediately
		try {
			await pushLeadToBitrix(lead);
		} catch (bitrixErr) {
			console.error("Bitrix sync failed:", bitrixErr.message);
			// Don't fail the whole request if Bitrix is down
		}

		res.status(201).json(newLead);
	} catch (error) {
		// TODO: learn this
		if (error.code === 11000) {
			return res
				.status(409)
				.json({ message: "Toto telefonní číslo již existuje." });
		}
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const lead = req.body;

		// FIXME:
		// const validLeads = leads.filter(
		// 	(lead) => lead.tel && lead.tel.trim() !== "",
		// );

		const updatedLead = await Lead.findByIdAndUpdate(id, lead, {
			new: true,
			runValidators: true,
		});

		if (!updatedLead) {
			return res.status(404).json({ message: "Lead not found" });
		}

		res.status(200).json(updatedLead);
	} catch (error) {
		console.error("Mongoose Error:", error.message);
		res.status(500).json({ message: error.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const deletedLead = await Lead.findByIdAndDelete(id);

		if (!deletedLead) {
			return res.status(404).json({ message: "Lead not found" });
		}

		res.status(200).json(deletedLead);
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
