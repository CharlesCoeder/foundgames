import { createServerClient } from "@supabase/ssr";

/**
 * This is a more flexible server client that works in both client and server contexts.
 * For true server components, use app/utils/supabase/server.ts instead.
 */
export async function createClient() {
  // Check if we're in a server environment where cookies() is available
  let cookieStore: any = null;

  // Dynamically import cookies to avoid client-side errors
  if (typeof window === "undefined") {
    try {
      // Try to import cookies from next/headers
      const { cookies } = await import("next/headers");
      cookieStore = cookies();
    } catch (e) {
      // If that fails, we're either in a client component or another context
      console.warn(
        "Could not import cookies from next/headers, using fallback"
      );
    }
  }

  // If we have access to cookies from next/headers
  if (cookieStore) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors in server components
            }
          },
        },
      }
    );
  }

  // Fallback for client components or other environments
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op in client components
        },
      },
    }
  );
}
