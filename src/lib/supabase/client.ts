import { createBrowserClient } from "@supabase/ssr";

/**
 * Kein typisiertes Generic — für Phase 1 reicht das. Phase 2 kann via
 * `supabase gen types typescript --linked` echte Typen erzeugen.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
