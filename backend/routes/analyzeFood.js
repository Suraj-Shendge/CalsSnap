import express from "express";
import { analyzeFood } from "../services/openaiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No input provided" });
    }

    const result = await analyzeFood(text);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;
