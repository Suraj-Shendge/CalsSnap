import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { image } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition AI. Analyze food image and return STRICT JSON:\n\n{
  "items": [
    {
      "name": "",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "total_calories": number
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this food image" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ]
    });

    let data;
    try {
      data = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      return res.status(500).json({ error: "Invalid AI JSON response" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image AI failed" });
  }
});

export default router;
