import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * ✅ Single source of truth: app.json → expo.extra
 */
const extra = Constants.expoConfig?.extra || {};

const supabaseUrl = extra.SUPABASE_URL;
const supabaseAnonKey = extra.SUPABASE_ANON_KEY;

/**
 * ❌ Fail FAST instead of silent crash later
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Supabase config missing. Fix app.json → expo.extra (SUPABASE_URL, SUPABASE_ANON_KEY)'
  );
}

/**
 * ✅ Create client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
