// backend/services/aggregateNutritionService.js

import fetch from "node-fetch";
import NodeCache from "node-cache";
import {
  NUTRITION_API_BASE,
  NUTRITION_API_KEY,
  NUTRITION_API_AUTH_HEADER,
  OPENFOODFACTS_API_BASE,
  USDA_API_BASE,
  USDA_API_KEY,
} from "../config.js";

const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

/* -----------------------------------------------------------------
   Helper: timeout-safe fetch
----------------------------------------------------------------- */
async function safeFetch(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

/* -----------------------------------------------------------------
   Helper: build headers (adds API key only when present)
----------------------------------------------------------------- */
function authHeaders(baseKey) {
  const headers = { "Content-Type": "application/json" };
  if (baseKey) {
    headers[NUTRITION_API_AUTH_HEADER] = baseKey;
  }
  return headers;
}

/* -----------------------------------------------------------------
   Helper – normalize names for deduplication
----------------------------------------------------------------- */
function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* -----------------------------------------------------------------
   Map OpenFoodFacts → unified schema
----------------------------------------------------------------- */
function mapOpenFoodFacts(product) {
  const nutr = product.nutriments || {};

  return {
    food_name: product.product_name || "",
    calories: Number(nutr["energy-kcal_100g"] ?? 0),
    protein: Number(nutr["proteins_100g"] ?? 0),
    carbs: Number(nutr["carbohydrates_100g"] ?? 0),
    fat: Number(nutr["fat_100g"] ?? 0),
    serving_size_g: 100,
    barcode: product.code?.trim() || "",
    brand: (product.brands?.split(",")[0] ?? "").trim(),
    source: "OpenFoodFacts",
    notes: product.generic_name?.trim() || "",
  };
}

/* -----------------------------------------------------------------
   Map USDA → unified schema
----------------------------------------------------------------- */
function mapUSDAFood(item) {
  const nutrients = item.labelNutrients || {};
  const getVal = (obj) => Number(obj?.value ?? 0);

  return {
    food_name: item.description || "",
    calories: getVal(nutrients.calories),
    protein: getVal(nutrients.protein),
    carbs: getVal(nutrients.carbohydrates),
    fat: getVal(nutrients.fat),
    serving_size_g: 100,
    barcode: item.fdcId?.toString() || "",
    brand: "",
    source: "USDA",
    notes: "",
  };
}

/* -----------------------------------------------------------------
   Custom dataset helpers
----------------------------------------------------------------- */
async function getFromCustomByName(name) {
  const url = `${NUTRITION_API_BASE}/food?name=${encodeURIComponent(name)}`;
  const res = await safeFetch(url, {
    method: "GET",
    headers: authHeaders(NUTRITION_API_KEY),
  });

  if (!res || res.status === 404) return null;
  if (!res.ok) return null;

  return await res.json();
}

async function getFromCustomByBarcode(barcode) {
  const url = `${NUTRITION_API_BASE}/barcode/${encodeURIComponent(barcode)}`;

  const res = await safeFetch(url, {
    method: "GET",
    headers: authHeaders(NUTRITION_API_KEY),
  });

  if (!res || res.status === 404) return null;
  if (!res.ok) return null;

  return await res.json();
}

/* -----------------------------------------------------------------
   OpenFoodFacts helpers (correct endpoint)
----------------------------------------------------------------- */
async function fuzzyFromOpenFoodFacts(term, limit = 20) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(term)}` +
    `&json=1&page_size=${limit}`;

  const res = await safeFetch(url);

  if (!res || !res.ok) return [];

  const json = await res.json();

  const hits = json?.products?.slice(0, limit) || [];

  return hits.map(mapOpenFoodFacts);
}

async function getFromOpenFoodFactsByBarcode(barcode) {
  const url =
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}`;

  const res = await safeFetch(url);

  if (!res || !res.ok) return null;

  const json = await res.json();

  if (!json.product) return null;

  return mapOpenFoodFacts(json.product);
}

/* -----------------------------------------------------------------
   USDA helpers
----------------------------------------------------------------- */
async function fuzzyFromUSDA(term, limit = 20) {
  if (!USDA_API_KEY) return [];

  const url =
    `${USDA_API_BASE}/foods/search` +
    `?api_key=${USDA_API_KEY}` +
    `&query=${encodeURIComponent(term)}` +
    `&pageSize=${limit}`;

  const res = await safeFetch(url);

  if (!res || !res.ok) return [];

  const json = await res.json();

  const items = json?.foods?.slice(0, limit) || [];

  return items.map(mapUSDAFood);
}

async function getFromUSDAByName(name) {
  const results = await fuzzyFromUSDA(name, 1);
  return results[0] || null;
}

/* -----------------------------------------------------------------
   PUBLIC API
----------------------------------------------------------------- */

export async function getNutritionByName(name) {
  let result = await getFromCustomByName(name);
  if (result) return result;

  result = await fuzzyFromOpenFoodFacts(name, 1);
  if (result.length) return result[0];

  return await getFromUSDAByName(name);
}

export async function getNutritionByBarcode(barcode) {
  let result = await getFromCustomByBarcode(barcode);
  if (result) return result;

  return await getFromOpenFoodFactsByBarcode(barcode);
}

/* -----------------------------------------------------------------
   Fuzzy Search
----------------------------------------------------------------- */

export async function fuzzySearch(term, limit = 20) {
  const cacheKey = `search:${term.toLowerCase()}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const perSource = Math.max(5, Math.floor(limit / 3));

  const [fromCustom, fromOpen, fromUSDA] = await Promise.all([
    (async () => {
      const url =
        `${NUTRITION_API_BASE}/search` +
        `?q=${encodeURIComponent(term)}` +
        `&limit=${perSource}`;

      const res = await safeFetch(url, {
        method: "GET",
        headers: authHeaders(NUTRITION_API_KEY),
      });

      if (!res || !res.ok) return [];

      return await res.json();
    })(),
    fuzzyFromOpenFoodFacts(term, perSource),
    fuzzyFromUSDA(term, perSource),
  ]);

  const merged = [...fromCustom, ...fromOpen, ...fromUSDA];

  const seen = new Set();
  const uniq = [];

  for (const item of merged) {
    const key = normalizeName(item.food_name);
    if (!key) continue;

    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(item);
    }

    if (uniq.length >= limit) break;
  }

  cache.set(cacheKey, uniq);

  return uniq;
}
