// backend/routes/barcode.js
import express from 'express';
import {
  getNutritionByBarcode,
} from '../services/aggregateNutritionService.js';
import { calculateHealthScore } from '../services/healthScore.js';
import { generateHealthAdvice } from '../services/groqLlmService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode required' });

  try {
    const nutrition = await getNutritionByBarcode(barcode);
    if (!nutrition) {
      return res
        .status(404)
        .json({ error: 'Barcode not found in any nutrition source' });
    }

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
      ...nutrition,
      health_score: healthScore,
      health_advice: healthAdvice,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
