import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

/**
 * ✅ Read config ONLY from app.json (expo.extra)
 */
const extra = Constants.expoConfig?.extra || {};

const API_URL = extra.API_URL;

if (!API_URL) {
  throw new Error("❌ API_URL missing. Fix app.json → expo.extra.API_URL");
}

/**
 * Core backend request handler
 */
async function backendFetch(
  endpoint: string,
  method: string = "GET",
  body?: any,
  isFormData: boolean = false
) {
  try {
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error("Authentication error");
    }
    
    const session = data?.session;

    if (!session?.access_token) {
      throw new Error("User not logged in");
    }

    const headers: any = {
      Authorization: `Bearer ${session.access_token}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    console.log(`Making ${method} request to: ${API_URL}/api${endpoint}`);
    
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const txt = await response.text();
      console.error(`API Error ${response.status}: ${txt}`);
      throw new Error(`API ${response.status}: ${txt}`);
    }

    return response.json();
  } catch (error) {
    console.error('Backend fetch error:', error);
    throw error; // Re-throw to let caller handle
  }
}

/** 📸 Scan food image */
export async function scanFood(imageUri: string) {
  try {
    const form = new FormData();

    // @ts-ignore (React Native FormData)
    form.append("image", {
      uri: imageUri,
      name: `scan_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    return await backendFetch("/scan-food", "POST", form, true);
  } catch (error) {
    console.error('Scan food error:', error);
    throw error;
  }
}

/** 💾 Save entry */
export async function saveFoodEntry(entry: any) {
  try {
    return await backendFetch("/food/save", "POST", entry);
  } catch (error) {
    console.error('Save food entry error:', error);
    throw error;
  }
}

/** 📊 Daily summary */
export async function getDailySummary() {
  try {
    return await backendFetch("/food/daily-summary");
  } catch (error) {
    console.error('Get daily summary error:', error);
    // Return default values to prevent app crash
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}

/** 📜 History */
export async function getFoodHistory(limit = 20, offset = 0) {
  try {
    return await backendFetch(`/food/history?limit=${limit}&offset=${offset}`);
  } catch (error) {
    console.error('Get food history error:', error);
    throw error;
  }
}

/** 🔍 Barcode scan */
export async function barcodeLookup(barcode: string) {
  try {
    return await backendFetch("/barcode-scan", "POST", { barcode });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    throw error;
  }
}

/** 🧾 OCR label */
export async function ocrLabel(imageUri: string) {
  try {
    const form = new FormData();

    // @ts-ignore
    form.append("image", {
      uri: imageUri,
      name: `ocr_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    return await backendFetch("/ocr-label", "POST", form, true);
  } catch (error) {
    console.error('OCR label error:', error);
    throw error;
  }
}
