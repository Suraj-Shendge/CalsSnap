import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const analyzeFood = async (text) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const prompt = `
You are a nutrition AI.

Analyze this food and return JSON ONLY:

Food: ${text}

Return format:
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

    const textResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON safely
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
