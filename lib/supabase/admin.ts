import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-Side Supabase Admin Client
 * 
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. This client must ONLY ever be loaded in server-side Next.js route handlers,
 *    server actions, or server utilities.
 * 2. It uses the privileged SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).
 * 3. NEVER prefix these environment variables with NEXT_PUBLIC_.
 * 4. NEVER import this file into React client components ('use client').
 */

if (typeof window !== "undefined") {
  throw new Error("[SECURITY CRITICAL] supabaseAdmin client cannot be instantiated in the browser.");
}

const DEFAULT_SUPABASE_URL = "https://dsqxvnmdoebfkqxqwktc.supabase.co";
const BUILD_PLACEHOLDER_KEY = "sb_secret_build_placeholder_key_kekulama";

export const isSupabaseConfigured = (): boolean => {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && key !== BUILD_PLACEHOLDER_KEY);
};

function getActiveClient(): SupabaseClient {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    BUILD_PLACEHOLDER_KEY;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Lazy Proxy ensuring createClient is never called with an empty string during Vercel build time
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getActiveClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
