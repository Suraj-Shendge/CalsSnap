import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";

import getUserProfile from "./routes/getUserProfile.js";
import saveUserProfile from "./routes/saveUserProfile.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/user", getUserProfile);
app.use("/save-profile", saveUserProfile);

// Health check
app.get("/", (req, res) => {
  res.send("Bite AI backend is running 🚀");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });
