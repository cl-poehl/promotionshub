"use server";

import { z } from "zod";

import { DATA_MODE } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EmailInput = z.object({ email: z.string().email() });

export async function sendMagicLinkAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (DATA_MODE === "mock") {
    return { ok: false, error: "Auth ist im Dev-Modus deaktiviert. Bitte Supabase konfigurieren." };
  }

  const parsed = EmailInput.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Ungültige E-Mail-Adresse." };

  if (formData.get("terms") !== "on") {
    return {
      ok: false,
      error: "Bitte akzeptiere die Nutzungsbedingungen.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) return { ok: false, error: "Versand fehlgeschlagen. Bitte später erneut versuchen." };
  return { ok: true };
}
