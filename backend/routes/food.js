import express from "express";
import { supabase } from "../server.js";
import { startOfDay, endOfDay } from "../utils/dateHelpers.js";

const router = express.Router();

/**
 * POST /food/save
 * Body: { food_name, calories, protein, carbs, fat, health_score, health_advice, image_url }
 */
router.post("/save", async (req, res) => {
  const user = req.user;

  const {
    food_name,
    calories,
    protein,
    carbs,
    fat,
    health_score,
    health_advice,
    image_url,
  } = req.body;

  if (!food_name) {
    return res.status(400).json({ error: "food_name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("FoodEntries")
      .insert([
        {
          user_id: user.id,
          food_name,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          health_score,
          health_advice,
          image_url,
        },
      ])
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      entry: data?.[0] || null,
    });
  } catch (e) {
    console.error("food/save error:", e);
    return res.status(500).json({ error: "Failed to save entry" });
  }
});

/**
 * GET /food/daily-summary
 */
router.get("/daily-summary", async (req, res) => {
  const user = req.user;

  const start = startOfDay(new Date()).toISOString();
  const end = endOfDay(new Date()).toISOString();

  try {
    const { data, error } = await supabase
      .from("FoodEntries")
      .select("calories, protein, carbs, fat")
      .eq("user_id", user.id)
      .gte("created_at", start)
      .lte("created_at", end);

    if (error) throw error;

    const summary = data.reduce(
      (acc, cur) => {
        acc.calories += Number(cur.calories) || 0;
        acc.protein += Number(cur.protein) || 0;
        acc.carbs += Number(cur.carbs) || 0;
        acc.fat += Number(cur.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return res.json(summary);
  } catch (e) {
    console.error("daily-summary error:", e);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
});

/**
 * GET /food/history?limit=20&offset=0
 */
router.get("/history", async (req, res) => {
  const user = req.user;

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  try {
    const { data, error } = await supabase
      .from("FoodEntries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.json(data);
  } catch (e) {
    console.error("history error:", e);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
