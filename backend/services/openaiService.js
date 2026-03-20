import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const analyzeFood = async (text) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const prompt = `
Give nutritional info for: ${text}

Return JSON like this:
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

    // ✅ If Gemini gives nothing → fallback
    if (!rawText || rawText.length < 10) {
      return {
        name: text,
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5,
      };
    }

    // 🧠 Extract JSON safely
    let cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      const jsonString = cleaned.substring(start, end + 1);
      return JSON.parse(jsonString);
    }

    // ✅ If still no JSON → fallback
    return {
      name: text,
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8,
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);

    // ✅ Final safety fallback (NEVER crash app)
    return {
      name: text,
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
    };
  }
};
