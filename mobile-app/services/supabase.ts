import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';


/**
 * ✅ Single source of truth: app.json → expo.extra
 */
const extra = Constants.expoConfig?.extra || {};

const supabaseUrl =
  Constants.expoConfig?.extra?.SUPABASE_URL ||
  "https://zwmebhmfwswtmeveujtx.supabase.co";

const supabaseAnonKey =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ||
  "sb_publishable_quLS4ZPZT8EUFeYuvAMlww_RMNAY9Ky";

/**
 * ❌ Fail FAST instead of silent crash later
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Supabase config missing. Fix app.json → expo.extra (SUPABASE_URL, SUPABASE_ANON_KEY)'
  );
}
console.log("EXTRA:", Constants.expoConfig?.extra);
console.log("SUPABASE URL:", supabaseUrl);
/**
 * ✅ Create client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
