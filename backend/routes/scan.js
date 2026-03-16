// backend/routes/scan.js
import express from 'express';
import multer from 'multer';
import { supabase } from '../server.js';
import { uploadImage } from '../services/storageService.js';
import { detectFoodRoboflow } from '../services/roboflowService.js';
import {
  getNutritionByName,
  fuzzySearch,
} from '../services/aggregateNutritionService.js';
import { generateHealthAdvice } from '../services/groqLlmService.js';
import { calculateHealthScore } from '../services/healthScore.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  const user = req.user;
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    // 1️⃣ Store image (unchanged)
    const filePath = `${user.id}/${Date.now()}_${req.file.originalname}`;
    const { publicUrl } = await uploadImage(filePath, req.file.buffer);

    // 2️⃣ Detect food via Roboflow
    const detections = await detectFoodRoboflow(req.file.buffer);

    // ---------------------------------------------------------
    // CASE A – AI detected a food
    // ---------------------------------------------------------
    if (detections && detections.length > 0) {
      const best = detections.reduce((a, b) =>
        b.confidence > a.confidence ? b : a
      );
      const foodName = best.label; // e.g. "Apple"
      const confidence = best.confidence;

      // 3️⃣ Nutrition lookup (aggregated service)
      const nutrition = await getNutritionByName(foodName);

      if (!nutrition) {
        // No exact match – give the user a few fuzzy suggestions
        const suggestions = await fuzzySearch(foodName, 5);
        return res.json({
          error: 'no_nutrition_match',
          message: `We recognized “${foodName}” but have no nutrition data for it.`,
          suggestions,
        });
      }

      // 4️⃣ Health score + LLM advice
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

      // 5️⃣ Respond (exact shape expected by the mobile app)
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
    // CASE B – AI found nothing – fall back to a generic fuzzy list
    // ---------------------------------------------------------
    const genericSuggestions = await fuzzySearch('food', 10);
    return res.json({
      error: 'no_detection',
      message: 'AI could not confidently identify a food in the image.',
      suggestions: genericSuggestions,
      image_url: publicUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
