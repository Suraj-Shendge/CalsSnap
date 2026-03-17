import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

/**
 * Resolve API URL safely for:
 * - Expo dev
 * - EAS / Codemagic builds
 */
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://zwmebhmfwswtmeveujtx.supabase.co",
      "supabaseAnonKey": "sb_publishable_quLS4ZPZT8EUFeYuvAMlww_RMNAY9Ky"
    }
  }
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants?.expoConfig?.extra?.API_URL ||
  Constants?.manifest?.extra?.API_URL ||
  "";

if (!API_URL) {
  console.warn("⚠️ API_URL is empty. Check EXPO_PUBLIC_API_URL env variable.");
}

async function backendFetch(
  endpoint: string,
  method = "GET",
  body?: any,
  isFormData = false
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

/** Scan a food image */
export async function scanFood(imageUri: string) {
  const form = new FormData();

  // @ts-ignore React Native FormData format
  form.append("image", {
    uri: imageUri,
    name: `scan_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  return backendFetch("/scan-food", "POST", form, true);
}

/** Save a scanned entry */
export async function saveFoodEntry(entry: any) {
  return backendFetch("/food/save", "POST", entry);
}

/** Get today's nutrition summary */
export async function getDailySummary() {
  return backendFetch("/food/daily-summary");
}

/** Get food history */
export async function getFoodHistory(limit = 20, offset = 0) {
  return backendFetch(`/food/history?limit=${limit}&offset=${offset}`);
}

/** Barcode lookup */
export async function barcodeLookup(barcode: string) {
  return backendFetch("/barcode-scan", "POST", { barcode });
}

/** OCR label scan */
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
