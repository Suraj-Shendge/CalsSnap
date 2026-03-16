
import { runPrediction } from './replicateService.js';
import { LLAMA3_MODEL_VERSION } from '../config.js';

/**
 * Generates a short health advice using LLaMA 3.
 * @param {Object} data – {food_name, calories, protein, carbs, fat}
 * @returns {Promise<string>}
 */
export async function generateHealthAdvice({ food_name, calories, protein, carbs, fat }) {
  const prompt = `
You are a friendly nutrition assistant. Provide a concise (max 2 sentences) health advice for a person who ate a serving of ${food_name} containing ${calories} kcal, ${protein}g protein, ${carbs}g carbs, and ${fat}g fat. Mention any noteworthy benefits or concerns.`;
  const output = await runPrediction(LLAMA3_MODEL_VERSION, { prompt });
  // Some models return an array of strings; join if needed.
  if (Array.isArray(output)) return output.join(' ');
  return output;
}
