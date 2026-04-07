import express from "express";
import Lead from "../models/Lead.js";
import pushLeadToBitrix from "../utils/bitrix.js";

const router = express.Router();

// POST /api/bitrix/sync
router.post("/sync", async (req, res) => {
	try {
		const leads = await Lead.find({});
		const results = { synced: [], failed: [] };

		for (const lead of leads) {
			try {
				const bitrixId = await pushLeadToBitrix(lead);
				results.synced.push({ tel: lead.tel, bitrixId });
			} catch (err) {
				results.failed.push({ tel: lead.tel, error: err.message });
			}
		}

		res.status(200).json(results);
	} catch (err) {
		res.status(500).json({ message: "Sync failed", error: err.message });
	}
});

export default router;
