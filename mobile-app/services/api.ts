
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const API_URL = Constants?.manifest?.extra?.API_URL ?? '';

async function backendFetch(
  endpoint: string,
  method = 'GET',
  body?: any,
  isFormData = false
) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('User not logged in');

  const headers: any = {
    Authorization: `Bearer ${session.access_token}`
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
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
  // @ts-ignore – React Native FormData works with fetch
  form.append('image', {
    uri: imageUri,
    name: `scan_${Date.now()}.jpg`,
    type: 'image/jpeg'
  } as any);
  return backendFetch('/scan-food', 'POST', form, true);
}

/** Save a scanned entry */
export async function saveFoodEntry(entry: any) {
  return backendFetch('/food/save', 'POST', entry);
}

/** Get today's nutrition summary */
export async function getDailySummary() {
  return backendFetch('/food/daily-summary');
}

/** Get food history (paginated) */
export async function getFoodHistory(limit = 20, offset = 0) {
  return backendFetch(`/food/history?limit=${limit}&offset=${offset}`);
}

/** Barcode lookup */
export async function barcodeLookup(barcode: string) {
  return backendFetch('/barcode-scan', 'POST', { barcode });
}

/** OCR on a food label image */
export async function ocrLabel(imageUri: string) {
  const form = new FormData();
  // @ts-ignore
  form.append('image', {
    uri: imageUri,
    name: `ocr_${Date.now()}.jpg`,
    type: 'image/jpeg'
  } as any);
  return backendFetch('/ocr-label', 'POST', form, true);
}
