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
  const { data } = await supabase.auth.getSession();
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

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`API ${response.status}: ${txt}`);
  }

  return response.json();
}

/** 📸 Scan food image */
export async function scanFood(imageUri: string) {
  const form = new FormData();

  // @ts-ignore (React Native FormData)
  form.append("image", {
    uri: imageUri,
    name: `scan_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  return backendFetch("/scan-food", "POST", form, true);
}

/** 💾 Save entry */
export async function saveFoodEntry(entry: any) {
  return backendFetch("/food/save", "POST", entry);
}

/** 📊 Daily summary */
export async function getDailySummary() {
  return backendFetch("/food/daily-summary");
}

/** 📜 History */
export async function getFoodHistory(limit = 20, offset = 0) {
  return backendFetch(`/food/history?limit=${limit}&offset=${offset}`);
}

/** 🔍 Barcode scan */
export async function barcodeLookup(barcode: string) {
  return backendFetch("/barcode-scan", "POST", { barcode });
}

/** 🧾 OCR label */
export async function ocrLabel(imageUri: string) {
  const form = new FormData();

  // @ts-ignore
  form.append("image", {
    uri: imageUri,
    name: `ocr_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  return backendFetch("/ocr-label", "POST", form, true);
}
