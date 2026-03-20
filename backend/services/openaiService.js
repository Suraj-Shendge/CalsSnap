import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const analyzeFood = async (text) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const prompt = `
You are a strict nutrition API.

Return ONLY valid JSON. No text, no explanation.

Food: ${text}

Format:
{
  "name": "food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Gemini RAW:", rawText);

    // 🧠 Smart JSON extraction
    let cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found in AI response");
    }

    const jsonString = cleaned.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);

    return parsed;

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
};
