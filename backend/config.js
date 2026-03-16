// backend/config.js
import dotenv from 'dotenv';
dotenv.config();

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Roboflow
export const ROBOFLOW_PRIVATE_API = process.env.ROBOFLOW_PRIVATE_API;
export const ROBOFLOW_MODEL_URL   = process.env.ROBOFLOW_MODEL_URL;

// GROQ
export const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// ------------------- YOUR PRIMARY NUTRITION API -------------------
export const NUTRITION_API_BASE = process.env.NUTRITION_API_BASE; // https://food-api-w7xp.onrender.com
export const NUTRITION_API_KEY   = process.env.NUTRITION_API_KEY   || '';
export const NUTRITION_API_AUTH_HEADER = process.env.NUTRITION_API_AUTH_HEADER || 'Authorization';

// ------------------- PUBLIC SUPPLEMENTS -------------------
export const OPENFOODFACTS_API_BASE = process.env.OPENFOODFACTS_API_BASE; // https://world.openfoodfacts.org/api/v2
export const USDA_API_BASE           = process.env.USDA_API_BASE;           // https://api.nal.usda.gov/fdc/v1
export const USDA_API_KEY           = process.env.USDA_API_KEY || '';       // w5kqYlpkb9LYP1K1GhMEjXdI0YGUShVYgLwkWUg0

// Stripe (optional)
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
export const STRIPE_SECRET_KEY       = process.env.STRIPE_SECRET_KEY;

