
import express from 'express';
import { fetchNutritionByBarcode } from '../services/openFoodFactsService.js';
import { calculateHealthScore } from '../services/healthScore.js';
import { generateHealthAdvice } from '../services/llamaService.js';

const router = express.Router();

/**
 * POST /barcode-scan
 * Body: { barcode: string }
 */
router.post('/', async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode required' });

  try {
    const nutrition = await fetchNutritionByBarcode(barcode);
    if (!nutrition) return res.status(404).json({ error: 'Product not found' });

    const healthScore = calculateHealthScore({
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    });

    const advice = await generateHealthAdvice({
      food_name: nutrition.food_name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    });

    return res.json({ ...nutrition, health_score: healthScore, health_advice: advice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
