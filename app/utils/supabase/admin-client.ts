import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the service role key for admin operations
 * This bypasses RLS policies and should ONLY be used in admin setup or other
 * secure client-side contexts where admin privileges are required.
 *
 * IMPORTANT: This should only be used in code that runs on the client with
 * proper authentication checks, since using the service role key
 * bypasses all security policies.
 */
export const createAdminClient = () => {
  // Ensure the service role key is available
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase environment variables");
    throw new Error("Service role key is not configured.");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );
};
