
import fetch from 'node-fetch';

/**
 * Search OpenFoodFacts by food name and return the first product’s nutrition.
 * @param {string} foodName
 * @returns {Promise<Object|null>} – {calories, protein, carbs, fat}
 */
export async function fetchNutritionByName(foodName) {
  const query = encodeURIComponent(foodName);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json.products || json.products.length === 0) return null;

  const product = json.products[0];
  const nutr = product.nutriments || {};

  return {
    calories: Number(nutr['energy-kcal_100g'] || 0),
    protein: Number(nutr['proteins_100g'] || 0),
    carbs: Number(nutr['carbohydrates_100g'] || 0),
    fat: Number(nutr['fat_100g'] || 0)
  };
}

/**
 * Lookup a product by barcode (EAN/UPC) and return nutrition.
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
export async function fetchNutritionByBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== 1) return null;
  const product = json.product;
  const nutr = product.nutriments || {};

  return {
    food_name: product.product_name || '',
    calories: Number(nutr['energy-kcal_100g'] || 0),
    protein: Number(nutr['proteins_100g'] || 0),
    carbs: Number(nutr['carbohydrates_100g'] || 0),
    fat: Number(nutr['fat_100g'] || 0)
  };
}
