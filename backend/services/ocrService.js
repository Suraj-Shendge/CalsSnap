
import { createWorker } from 'tesseract.js';

/**
 * Runs OCR on an image buffer and extracts the four macro values.
 * Returns {calories, protein, carbs, fat}
 */
export async function extractNutritionFromImage(imageBuffer) {
  const worker = await createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(imageBuffer);
  await worker.terminate();

  const text = data.text.toLowerCase();
  const lines = text.split('\n');

  const result = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  for (const line of lines) {
    if (!result.calories && line.includes('calor')) {
      const m = line.match(/(\d+\.?\d*)\s*k?cal/);
      if (m) result.calories = parseFloat(m[1]);
    }
    if (!result.protein && line.includes('protein')) {
      const m = line.match(/(\d+\.?\d*)\s*g\s*protein/);
      if (m) result.protein = parseFloat(m[1]);
    }
    if (!result.carbs && (line.includes('carb') || line.includes('carbohydrate'))) {
      const m = line.match(/(\d+\.?\d*)\s*g\s*(carb|carbohydrate)/);
      if (m) result.carbs = parseFloat(m[1]);
    }
    if (!result.fat && line.includes('fat')) {
      const m = line.match(/(\d+\.?\d*)\s*g\s*fat/);
      if (m) result.fat = parseFloat(m[1]);
    }
  }
  return result;
}
