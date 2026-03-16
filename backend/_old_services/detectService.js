
// import { runPrediction } from './replicateService.js';
import { YOLOV8_MODEL_VERSION } from '../config.js';

/**
 * Runs YOLOv8 detection on a publicly reachable image URL.
 * @param {string} imageUrl – Supabase public URL
 * @returns {Promise<Array>} – list of detections [{label, confidence, box}, …]
 */
export async function detectFood(imageUrl) {
  // Replicate YOLOv8 model expects {image: <url>}
  const output = await runPrediction(YOLOV8_MODEL_VERSION, { image: imageUrl });
  // The exact output depends on the model; we assume an array of detections.
  return output;
}
