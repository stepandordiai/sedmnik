import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workRoutes from "./routes/work.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
	"https://weekly-planner-frontend.netlify.app",
	"http://localhost:3000",
	"http://localhost:5173",
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
	})
);

app.use("/api/users", authRoutes);

app.use("/api/work", workRoutes);

app.get("/health", (req, res) => {
	res.status(200).write("ok");
	res.end();
});

app.listen(PORT, () => {
	console.log(`Server started at port ${PORT}`);
});
