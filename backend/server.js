// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

import authMiddleware from "./middleware/auth.js";

import scanRouter from "./routes/scan.js";
import barcodeRouter from "./routes/barcode.js";
import ocrRouter from "./routes/ocr.js";
import foodRouter from "./routes/food.js";
import foodSearchRouter from "./routes/foodSearch.js";

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./config.js";

dotenv.config();

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate limiter (protects AI APIs + DB)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max requests per IP per minute
});
app.use(limiter);

// ---------- Supabase ----------
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ---------- Public Routes ----------
// Food search should be public for fast UX
app.use("/api/food-search", foodSearchRouter);

// ---------- Protected Routes ----------
app.use("/api/scan-food", authMiddleware, scanRouter);
app.use("/api/barcode-scan", authMiddleware, barcodeRouter);
app.use("/api/ocr-label", authMiddleware, ocrRouter);
app.use("/api/food", authMiddleware, foodRouter);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("🍽️ Bite backend is running");
});

// ---------- Server ----------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
