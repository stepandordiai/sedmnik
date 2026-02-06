import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workRoutes from "./routes/work.js";
import usersRoutes from "./routes/users.js";
import buildingsRoutes from "./routes/buildings.js";
import buildingRoutes from "./routes/building.js";
import toolsRoutes from "./routes/tools.js";
import leadsRoutes from "./routes/leads.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
	"https://sedmnik.netlify.app",
	"http://localhost:3000",
	"http://localhost:5173",
	"https://www.flovas.cz",
];

// CORS for frontend domain
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			}
		},
		// credentials: true,
	}),
);
app.use("/api", authRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/work", workRoutes);

app.use("/api/buildings", buildingsRoutes);

app.use("/api/building", buildingRoutes);

app.use("/tools", toolsRoutes);

app.get("/health", (req, res) => {
	res.status(200).write("ok");
	res.end();
});

app.use("/leads", leadsRoutes);

app.listen(PORT, () => {
	console.log(`Server started at port ${PORT}`);
});
