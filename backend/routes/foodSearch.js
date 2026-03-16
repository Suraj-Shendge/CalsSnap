// backend/routes/foodSearch.js
import express from 'express';
import { fuzzySearch } from '../services/aggregateNutritionService.js';

const router = express.Router();

/**
 * GET /api/food-search?q=term&page=1&limit=20
 * Returns a paginated list that the mobile UI can display.
 */
router.get('/', async (req, res) => {
  const term = req.query.q?.trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!term) return res.status(400).json({ error: 'Missing query param `q`' });

  try {
    // Get up to `limit` merged results from all sources
    const all = await fuzzySearch(term, limit * 2); // pull a few extra then slice
    const start = (page - 1) * limit;
    const slice = all.slice(start, start + limit);
    const response = {
      data: slice,
      page,
      limit,
      total: all.length,
      hasNext: start + limit < all.length,
      hasPrev: start > 0,
    };
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
