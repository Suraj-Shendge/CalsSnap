import fetch from 'node-fetch';
import { GROQ_API_KEY, GROQ_MODEL } from '../config.js';

if (!GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is missing – health‑advice generation will fail.');
}

/**
 * Call GROQ’s chat‑completion endpoint (LLaMA‑3.1‑8B‑Instant) to generate
 * a short health‑advice sentence for a food.
 *
 * @param {{ food_name:string, calories:number, protein:number, carbs:number, fat:number }} data
 * @returns {Promise<string>} – a trimmed advice string
 */
export async function generateHealthAdvice(data) {
  const prompt = `
You are a friendly nutrition assistant. Provide a concise (max 2‑sentence) health advice for a person who ate a serving of ${data.food_name} containing ${data.calories} kcal, ${data.protein} g protein, ${data.carbs} g carbs and ${data.fat} g fat. Mention any notable benefits or concerns.
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`GROQ request failed (${response.status}): ${txt}`);
  }

  const json = await response.json();
  // The Groq API follows the OpenAI schema:
  //   choices[0].message.content
  const advice = json?.choices?.[0]?.message?.content;
  return (advice ?? '').trim();
}
