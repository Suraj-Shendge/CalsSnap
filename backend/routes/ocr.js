
import express from 'express';
import multer from 'multer';
import { extractNutritionFromImage } from '../services/ocrService.js';
import { calculateHealthScore } from '../services/healthScore.js';
import { generateHealthAdvice } from '../services/llamaService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /ocr-label
 * multipart/form-data { image: <file> }
 */
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  try {
    const nutrition = await extractNutritionFromImage(req.file.buffer);
    const healthScore = calculateHealthScore(nutrition);
    const advice = await generateHealthAdvice({
      food_name: 'custom label',
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
