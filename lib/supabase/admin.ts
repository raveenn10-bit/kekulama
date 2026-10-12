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

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dsqxvnmdoebfkqxqwktc.supabase.co";

const supabaseSecretKey = 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  "";

const isConfigured = Boolean(
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && 
  (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
);

if (!isConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    "[SUPABASE WARNING] SUPABASE_URL or SUPABASE_SECRET_KEY is not configured in environment. Using fallback credentials for local compilation."
  );
}

export const isSupabaseConfigured = (): boolean => isConfigured;

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
