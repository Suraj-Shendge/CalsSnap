// backend/routes/scan.js

import express from "express";
import multer from "multer";
import { supabase } from "../server.js";
import { uploadImage } from "../services/storageService.js";
import { detectFoodRoboflow } from "../services/roboflowService.js";
import {
  getNutritionByName,
  fuzzySearch,
} from "../services/aggregateNutritionService.js";
import { generateHealthAdvice } from "../services/groqLlmService.js";
import { calculateHealthScore } from "../services/healthScore.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    // ---------------------------------------------------------
    // 1️⃣ Store image
    // ---------------------------------------------------------
    const filePath = `${user.id}/${Date.now()}_${req.file.originalname}`;
    const { publicUrl } = await uploadImage(filePath, req.file.buffer);

    // ---------------------------------------------------------
    // 2️⃣ Detect food via Roboflow
    // ---------------------------------------------------------
    const detections = await detectFoodRoboflow(req.file.buffer);

    // ---------------------------------------------------------
    // CASE A – AI detected foods
    // ---------------------------------------------------------
    if (detections && detections.length > 0) {
      // Sort detections by confidence
      detections.sort((a, b) => b.confidence - a.confidence);

      const best = detections[0];
      const foodName = best.label;
      const confidence = best.confidence;

      // ---------------------------------------------------------
      // 3️⃣ Nutrition lookup
      // ---------------------------------------------------------
      const nutrition = await getNutritionByName(foodName);

      // ---------------------------------------------------------
      // CASE A1 – Exact nutrition match found
      // ---------------------------------------------------------
      if (nutrition) {
        const healthScore = calculateHealthScore({
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        });

        const healthAdvice = await generateHealthAdvice({
          food_name: nutrition.food_name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        });

        return res.json({
          food_name: nutrition.food_name,
          confidence,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          health_score: healthScore,
          health_advice: healthAdvice,
          image_url: publicUrl,
        });
      }

      // ---------------------------------------------------------
      // CASE A2 – AI detected food but nutrition not found
      // Provide suggestions for user to pick
      // ---------------------------------------------------------
      const suggestions = await fuzzySearch(foodName, 5);

      return res.json({
        error: "no_nutrition_match",
        ai_detected: foodName,
        confidence,
        message: `We recognized "${foodName}" but couldn't find exact nutrition.`,
        suggestions,
        image_url: publicUrl,
      });
    }

    // ---------------------------------------------------------
    // CASE B – AI detected nothing
    // ---------------------------------------------------------
    const genericSuggestions = await fuzzySearch("food", 10);

    return res.json({
      error: "no_detection",
      message: "AI could not confidently identify a food in the image.",
      suggestions: genericSuggestions,
      image_url: publicUrl,
    });
  } catch (err) {
    console.error("scan error:", err);

    return res.status(500).json({
      error: "Food scan failed",
    });
  }
});

export default router;
