import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl =
  Constants.expoConfig?.extra?.SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
