import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(
	cors({
		origin: "https://weekly-planner-frontend.netlify.app/",
		// TODO:
		credentials: true,
	})
);

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected ${conn.connection.host}`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

connectDB();

//Routes
app.use("/api", userRoutes);

app.get("/", (req, res) => {
	res.send("Hello Traveller...");
});

app.listen(PORT, () => {
	console.log(`Server started at port ${PORT}`);
});
