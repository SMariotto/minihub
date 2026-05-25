import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    console.warn(
      "[business-logic] Supabase não configurado: SUPABASE_URL ou SUPABASE_ANON_KEY ausentes."
    );
  }
  supabaseInstance = createClient(url || "", anonKey || "");
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    console.warn(
      "[business-logic] getSupabase() chamado antes de initSupabase(). Retornando cliente sem credenciais."
    );
    supabaseInstance = createClient("", "");
  }
  return supabaseInstance;
}