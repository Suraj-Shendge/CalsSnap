<<<<<<< HEAD
// backend/services/roboflowService.js
=======
>>>>>>> 0310870 (fix gitignore and remove node_modules)
import fetch from 'node-fetch';
import FormData from 'form-data';
import {
  ROBOFLOW_PRIVATE_API,
  ROBOFLOW_MODEL_URL,
} from '../config.js';

if (!ROBOFLOW_PRIVATE_API || !ROBOFLOW_MODEL_URL) {
  console.warn(
    '⚠️ Roboflow credentials are missing – food detection will fail.'
  );
}

/**
 * Sends an image buffer to your Roboflow model and returns an array of
 * detections in the shape:
<<<<<<< HEAD
 *   [{ label: string, confidence: number, box?: {x, y, width, height} }, ...]
=======
 *   [{ label: string, confidence: number, box?: {x, y, width, height} }, …]
>>>>>>> 0310870 (fix gitignore and remove node_modules)
 *
 * @param {Buffer} imageBuffer  – raw JPEG/PNG data from Multer
 * @returns {Promise<Array<{label:string,confidence:number}>>}
 */
export async function detectFoodRoboflow(imageBuffer) {
<<<<<<< HEAD
  // Roboflow expects a multipart/form‑data request with the field name "file"
=======
  // Roboflow expects multipart/form‑data with the field name "file"
>>>>>>> 0310870 (fix gitignore and remove node_modules)
  const form = new FormData();
  form.append('file', imageBuffer, {
    filename: 'upload.jpg',
    contentType: 'image/jpeg',
  });

<<<<<<< HEAD
  // Build the request URL, inserting your private API key as a query param
=======
  // Insert the private API key as a query parameter
>>>>>>> 0310870 (fix gitignore and remove node_modules)
  const endpoint = `${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_PRIVATE_API}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Roboflow error ${response.status}: ${txt}`);
  }

  const result = await response.json();

<<<<<<< HEAD
  // The exact shape depends on the model you trained.
  // Most Roboflow detection models return:
  //   { predictions: [{ class: "...", confidence: 0.xx, x:..., y:..., width:..., height:... }, ...] }
  // We'll normalise it to [{ label, confidence, box? }]
  const predictions = result?.predictions || result?.objects || [];

=======
  // Different Roboflow models may return `predictions` or `objects`
  const predictions = result?.predictions || result?.objects || [];

  // Normalise to the shape the scan route expects
>>>>>>> 0310870 (fix gitignore and remove node_modules)
  const detections = predictions.map((p) => ({
    label: p.class || p.label || '',
    confidence: p.confidence ?? 0,
    box: {
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
    },
  }));

  return detections;
}
