import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeFood(text) {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `Return JSON only:\n        {\n          "items":[{"name":"","calories":0,"protein":0,"carbs":0,"fat":0}],\n          "total_calories":0\n        }`
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
