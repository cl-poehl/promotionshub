import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase-Client für Server Components / Route Handlers / Server Actions.
 * Nutzt den anonymen Schlüssel + Session-Cookie (RLS greift).
 *
 * Kein typisiertes Generic — Phase 1. Für Phase 2 echte Typen via
 * `supabase gen types typescript --linked` einziehen.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items) {
          try {
            for (const { name, value, options } of items) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // In Server Components nicht setzbar; das Middleware-Refresh übernimmt.
          }
        },
      },
    },
  );
}

/**
 * Service-Rolle. NUR in vertrauenswürdigem Server-Code verwenden
 * (z.B. Moderations-Pipeline, Admin-Aktionen). Umgeht RLS.
 */
export function createSupabaseServiceClient() {
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
