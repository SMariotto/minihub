import { supabase as getSupabaseClient } from "../index";

export { getSupabaseClient };

export function getSupabase() {
  return getSupabaseClient;
}
