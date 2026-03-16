// backend/services/aggregateNutritionService.js
import fetch from 'node-fetch';
import {
  NUTRITION_API_BASE,
  NUTRITION_API_KEY,
  NUTRITION_API_AUTH_HEADER,
  OPENFOODFACTS_API_BASE,
  USDA_API_BASE,
  USDA_API_KEY,
} from '../config.js';

/* -----------------------------------------------------------------
   Helper: build headers (adds API key only when present)
   ----------------------------------------------------------------- */
function authHeaders(baseKey) {
  const headers = { 'Content-Type': 'application/json' };
  if (baseKey) {
    // For our custom API we use the header name from config
    headers[NUTRITION_API_AUTH_HEADER] = baseKey;
  }
  return headers;
}

/* -----------------------------------------------------------------
   1️⃣ Helper – map OpenFoodFacts product → CalSnap schema
   ----------------------------------------------------------------- */
function mapOpenFoodFacts(product) {
  const nutr = product.nutriments || {};
  return {
    food_name: product.product_name || '',
    calories: Number(nutr['energy-kcal_100g'] ?? 0),
    protein: Number(nutr['proteins_100g'] ?? 0),
    carbs: Number(nutr['carbohydrates_100g'] ?? 0),
    fat: Number(nutr['fat_100g'] ?? 0),
    serving_size_g: 100, // OMF gives per‑100 g
    barcode: product.code?.trim() || '',
    brand: (product.brands?.split(',')[0] ?? '').trim(),
    source: 'OpenFoodFacts',
    notes: product.generic_name?.trim() || '',
  };
}

/* -----------------------------------------------------------------
   2️⃣ Helper – map USDA food → CalSnap schema
   ----------------------------------------------------------------- */
function mapUSDAFood(item) {
  const nutrients = item.labelNutrients || {};
  const getVal = (obj) => Number(obj?.value ?? 0);

  return {
    food_name: item.description || '',
    calories: getVal(nutrients.calories),
    protein: getVal(nutrients.protein),
    carbs: getVal(nutrients.carbohydrates),
    fat: getVal(nutrients.fat),
    serving_size_g: 100, // USDA reports per 100 g by default for many nutrients
    barcode: item.fdcId?.toString() || '',
    brand: '',
    source: 'USDA',
    notes: '',
  };
}

/* -----------------------------------------------------------------
   3️⃣ Primary (custom) API helpers – unchanged from before
   ----------------------------------------------------------------- */
async function getFromCustomByName(name) {
  const url = `${NUTRITION_API_BASE}/food?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders(NUTRITION_API_KEY),
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return await res.json();
}
async function getFromCustomByBarcode(barcode) {
  const url = `${NUTRITION_API_BASE}/barcode/${encodeURIComponent(barcode)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders(NUTRITION_API_KEY),
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return await res.json();
}

/* -----------------------------------------------------------------
   4️⃣ OpenFoodFacts helpers
   ----------------------------------------------------------------- */
async function getFromOpenFoodFactsByName(name) {
  const url = `${OPENFOODFACTS_API_BASE}/search?search_terms=${encodeURIComponent(
    name
  )}&json=1&page_size=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const product = json?.products?.[0];
  return product ? mapOpenFoodFacts(product) : null;
}
async function getFromOpenFoodFactsByBarcode(barcode) {
  const url = `${OPENFOODFACTS_API_BASE}/product/${encodeURIComponent(
    barcode
  )}.json`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1) return null;
  return mapOpenFoodFacts(json.product);
}
async function fuzzyFromOpenFoodFacts(term, limit = 20) {
  const url = `${OPENFOODFACTS_API_BASE}/search?search_terms=${encodeURIComponent(
    term
  )}&json=1&page_size=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  const hits = json?.products?.slice(0, limit) || [];
  return hits.map(mapOpenFoodFacts);
}

/* -----------------------------------------------------------------
   5️⃣ USDA helpers
   ----------------------------------------------------------------- */
async function getFromUSDAByName(name) {
  if (!USDA_API_KEY) return null;
  const url = `${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
    name
  )}&pageSize=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json?.foods?.[0];
  return item ? mapUSDAFood(item) : null;
}
async function getFromUSDAByBarcode(barcode) {
  // USDA does **not** support direct barcode lookup; we fall back to name search
  return null;
}
async function fuzzyFromUSDA(term, limit = 20) {
  if (!USDA_API_KEY) return [];
  const url = `${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
    term
  )}&pageSize=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  const items = json?.foods?.slice(0, limit) || [];
  return items.map(mapUSDAFood);
}

/* -----------------------------------------------------------------
   PUBLIC API of this service – what the routes will call
   ----------------------------------------------------------------- */

/**
 * Exact name lookup – tries Custom → OpenFoodFacts → USDA (first match wins)
 */
export async function getNutritionByName(name) {
  // Try primary custom API first
  let result = await getFromCustomByName(name);
  if (result) return result;

  // Fallback to OpenFoodFacts
  result = await getFromOpenFoodFactsByName(name);
  if (result) return result;

  // Finally try USDA
  return await getFromUSDAByName(name);
}

/**
 * Barcode lookup – tries Custom → OpenFoodFacts (USDA does not have a barcode endpoint)
 */
export async function getNutritionByBarcode(barcode) {
  let result = await getFromCustomByBarcode(barcode);
  if (result) return result;

  result = await getFromOpenFoodFactsByBarcode(barcode);
  if (result) return result;

  // USDA has no direct barcode endpoint (return null)
  return null;
}

/**
 * Fuzzy / partial search.
 * Calls all three sources, merges the arrays, de‑duplicates by `food_name`
 * (case‑insensitive) and returns up to `limit` results.
 */
export async function fuzzySearch(term, limit = 20) {
  // We request a slice from each source; distribute the limit evenly.
  const perSource = Math.max(5, Math.floor(limit / 3));

  const [
    fromCustom,
    fromOpen,
    fromUSDA,
  ] = await Promise.all([
    // Custom API – we already have a `/search` endpoint that returns an array
    (async () => {
      const url = `${NUTRITION_API_BASE}/search?q=${encodeURIComponent(
        term
      )}&limit=${perSource}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: authHeaders(NUTRITION_API_KEY),
      });
      if (!res.ok) return [];
      return await res.json(); // assume array of objects already in correct shape
    })(),
    fuzzyFromOpenFoodFacts(term, perSource),
    fuzzyFromUSDA(term, perSource),
  ]);

  // Merge and deduplicate (case‑insensitive)
  const merged = [...fromCustom, ...fromOpen, ...fromUSDA];
  const seen = new Set();
  const uniq = [];

  for (const item of merged) {
    const key = (item.food_name || '').toLowerCase();
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(item);
    }
    if (uniq.length >= limit) break;
  }

  return uniq;
}
