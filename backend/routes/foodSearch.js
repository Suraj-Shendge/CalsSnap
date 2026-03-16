// backend/routes/foodSearch.js
import express from "express";
import { fuzzySearch } from "../services/aggregateNutritionService.js";

const router = express.Router();

/**
 * GET /api/food-search?q=term&page=1&limit=20
 */
router.get("/", async (req, res) => {
  const term = req.query.q?.trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!term) {
    return res.status(400).json({ error: "Missing query param `q`" });
  }

  const safeLimit = Math.min(limit, 50);

  try {
    const all = await fuzzySearch(term, safeLimit * 2);

    const start = (page - 1) * safeLimit;
    const slice = all.slice(start, start + safeLimit);

    res.json({
      data: slice,
      page,
      limit: safeLimit,
      total: all.length,
      hasNext: start + safeLimit < all.length,
      hasPrev: start > 0,
    });
  } catch (err) {
    console.error("food-search error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
