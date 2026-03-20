import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeFood = async (text) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const prompt = `
You are a nutrition expert.

Analyze the following food and return JSON:
- name
- calories
- protein (g)
- carbs (g)
- fat (g)

Food: ${text}

Respond ONLY in JSON format.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a nutrition AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const output = response.choices[0].message.content;

    // Try parsing JSON safely
    try {
      return JSON.parse(output);
    } catch {
      return {
        raw: output,
      };
    }

  } catch (error) {
    console.error("OpenAI ERROR:", error.message);

    return {
      error: "AI failed",
      details: error.message,
    };
  }
};
