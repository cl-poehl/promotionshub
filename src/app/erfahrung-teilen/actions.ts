"use server";

import { z } from "zod";

import { DATA_MODE } from "@/lib/data";
import { flags } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidish } from "@/lib/validation";

const Score = z.coerce.number().int().min(1).max(5);

const ReviewInput = z.object({
  group_id: z
    .string()
    .min(1, "Bitte eine Gruppe auswählen.")
    .pipe(uuidish("Ungültige Gruppe — bitte aus der Liste wählen.")),
  thesis_type: z.enum(["experimental", "clinical", "statistical", "other"], {
    error: "Bitte einen Thesis-Typ wählen.",
  }),
  year_started: z.coerce
    .number({ error: "Bitte ein Startjahr wählen." })
    .int()
    .min(2000)
    .max(new Date().getFullYear()),
  year_ended: z
    .union([z.literal(""), z.coerce.number().int().min(2000).max(new Date().getFullYear() + 5)])
    .transform((v) => (v === "" ? null : v)),
  supervision_quality: Score,
  responsiveness: Score,
  timeline_realism: Score,
  project_delivered: Score,
  would_recommend: Score,
  free_text: z.string().trim().max(3000).optional().or(z.literal("")),
  truthful: z.literal("on", { error: "Bitte Bestätigung ankreuzen." }),
});

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReviewAction(formData: FormData): Promise<SubmitReviewResult> {
  if (DATA_MODE === "mock") {
    return { ok: false, error: "Im Dev-Modus deaktiviert. Bitte Supabase konfigurieren." };
  }

  const parsed = ReviewInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Bitte zuerst anmelden." };

  // reviewer_account muss existieren (wird im Auth-Callback angelegt).
  const { data: account } = await supabase
    .from("reviewer_accounts")
    .select("id, identity_verified")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!account || !account.identity_verified) {
    return { ok: false, error: "Konto noch nicht verifiziert." };
  }

  const freeText = data.free_text?.trim() || null;

  const { error } = await supabase.from("reviews").insert({
    reviewer_account_id: account.id,
    group_id: data.group_id,
    supervisor_id: null,
    thesis_type: data.thesis_type,
    year_started: data.year_started,
    year_ended: data.year_ended,
    supervision_quality: data.supervision_quality,
    responsiveness: data.responsiveness,
    timeline_realism: data.timeline_realism,
    project_delivered: data.project_delivered,
    would_recommend: data.would_recommend,
    free_text: freeText,
    // Phase 1: Freitext bleibt grundsätzlich `pending_moderation` (oder `none`),
    // wird nie automatisch publiziert. Anthropic-Triage in Phase 2.
    free_text_status: freeText ? (flags.REVIEW_FREE_TEXT_ENABLED ? "pending_moderation" : "none") : "none",
    // Phase 1: Reviews bleiben `pending` und fließen NICHT in öffentliche Anzeige ein
    // (Aggregate würden sie zwar zählen, aber Schwellenwert sperrt die Anzeige).
    // §1 Phase 2 schaltet das auf `published` nach Verifizierung.
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Du hast für diese Kombination schon einen Bericht abgegeben." };
    }
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  return { ok: true };
}
