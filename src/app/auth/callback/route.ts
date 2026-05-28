import { NextResponse } from "next/server";

import { classifyEmail } from "@/lib/auth/university-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Magic-Link-Callback. Tauscht den `code` gegen eine Session,
 * legt bei Bedarf einen reviewer_account an und setzt das
 * Student-Signal anhand der Email-Domäne.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL(`/anmelden?error=Kein+Anmeldecode`, url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/anmelden?error=${encodeURIComponent("Anmeldung fehlgeschlagen")}`, url.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const emailType = classifyEmail(user.email);
    const studentSignal = emailType === "university" ? "verified_student" : "accountable_only";

    // Upsert reviewer_account (idempotent).
    await supabase.from("reviewer_accounts").upsert(
      {
        user_id: user.id,
        email: user.email,
        email_type: emailType,
        student_signal: studentSignal,
        identity_verified: true,
        verification_tier: "email",
      },
      { onConflict: "user_id" },
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
