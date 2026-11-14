import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env.ts";

let client: SupabaseClient | undefined;

export const isSupabaseConfigured = (): boolean =>
  Boolean(env.supabaseUrl && env.supabaseSecretKey);

export function getSupabaseClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseSecretKey) return null;
  client ??= createClient(env.supabaseUrl, env.supabaseSecretKey, {
    global: {fetch: (input, init) => fetch(input, {...init, signal: AbortSignal.any([AbortSignal.timeout(15000), ...(init?.signal ? [init.signal] : [])])})},
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
