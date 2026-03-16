
import fetch from 'node-fetch';
import { REPLICATE_API_TOKEN } from '../config.js';

if (!REPLICATE_API_TOKEN) {
  console.warn('⚠️ REPLICATE_API_TOKEN is not set – Replicate calls will fail.');
}

/**
 * Executes a Replicate prediction (polls until the job finishes).
 * @param {string} modelVersion – Replicate model version hash
 * @param {Object} input – model‑specific input payload
 * @returns {Promise<any>} – model output
 */
export async function runPrediction(modelVersion, input) {
  const url = 'https://api.replicate.com/v1/predictions';
  const headers = {
    Authorization: `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const initRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ version: modelVersion, input })
  });
  if (!initRes.ok) {
    const txt = await initRes.text();
    throw new Error(`Replicate init error ${initRes.status}: ${txt}`);
  }
  const initData = await initRes.json();
  const predictionId = initData.id;

  // Poll status
  while (true) {
    await new Promise(r => setTimeout(r, 1500));
    const pollRes = await fetch(`${url}/${predictionId}`, {
      method: 'GET',
      headers
    });
    if (!pollRes.ok) {
      const txt = await pollRes.text();
      throw new Error(`Replicate poll error ${pollRes.status}: ${txt}`);
    }
    const poll = await pollRes.json();
    if (poll.status === 'succeeded') {
      return poll.output;
    }
    if (poll.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${poll.error}`);
    }
    // else status = "starting" | "processing" – continue looping
  }
}
