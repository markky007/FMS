/**
 * Supabase client boot file
 * Initializes the Supabase client and provides it via inject/provide
 */

import { defineBoot } from "#q-app";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)",
  );
}

/** Singleton Supabase client instance */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export default defineBoot(({ app }) => {
  app.provide("supabase", supabase);
});
