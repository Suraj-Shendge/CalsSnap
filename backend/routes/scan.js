
import express from 'express';
import multer from 'multer';
import { supabase } from '../server.js';
import { uploadImage } from '../services/storageService.js';
import { detectFood } from '../services/detectService.js';
import { fetchNutritionByName } from '../services/openFoodFactsService.js';
import { generateHealthAdvice } from '../services/llamaService.js';
import { calculateHealthScore } from '../services/healthScore.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /scan-food
 * multipart/form-data { image: <file> }
 */
router.post('/', upload.single('image'), async (req, res) => {
  const user = req.user;
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  try {
    // 1️⃣ Upload image to Supabase (public)
    const filePath = `${user.id}/${Date.now()}_${req.file.originalname}`;
    const { publicUrl } = await uploadImage(filePath, req.file.buffer);

    // 2️⃣ YOLOv8 detection
    const detections = await detectFood(publicUrl);
    if (!detections || detections.length === 0) {
      throw new Error('No objects detected');
    }
    const best = detections.reduce((a, b) => (b.confidence > a.confidence ? b : a), detections[0]);

    // 3️⃣ Clean label (YOLO often returns snake_case)
    const foodName = best.label.replace(/_/g, ' ');

    // 4️⃣ Nutrition lookup
    const nutrition = await fetchNutritionByName(foodName);
    if (!nutrition) {
      throw new Error(`No nutrition info for "${foodName}"`);
    }

    // 5️⃣ Health score
    const healthScore = calculateHealthScore({
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    });

    // 6️⃣ LLaMA 3 advice
    const advice = await generateHealthAdvice({
      food_name: foodName,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    });

    // 7️⃣ Respond
    return res.json({
      food_name: foodName,
      confidence: best.confidence,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      health_score: healthScore,
      health_advice: advice,
      image_url: publicUrl
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
