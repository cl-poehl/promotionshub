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
  listing_id: z
    .union([z.literal(""), uuidish("Ungültige AG-Auswahl.")])
    .transform((v) => (v === "" ? null : v))
    .optional()
    .nullable(),
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
  // Neue strukturierte Felder
  promotion_status: z.enum(["ongoing", "completed", "discontinued"], {
    error: "Bitte den Status deiner Promotion angeben.",
  }),
  weekly_hours: z.enum(["fulltime", "parttime_high", "parttime_low", "occasional"], {
    error: "Bitte deinen wöchentlichen Zeitaufwand angeben.",
  }),
  publication_outcome: z.enum(
    ["first_author", "coauthor", "mentioned", "none", "in_progress"],
    { error: "Bitte deinen Publikations-Status angeben." },
  ),
  funding_as_promised: z.enum(["yes", "partial", "no", "na"], {
    error: "Bitte angeben, ob die Förderung wie versprochen war.",
  }),
  what_went_well: z.string().trim().max(1500).optional().or(z.literal("")),
  what_went_hard: z.string().trim().max(1500).optional().or(z.literal("")),
  tip_for_successors: z.string().trim().max(1500).optional().or(z.literal("")),
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

  const clean = (s?: string | null) => {
    const t = s?.trim();
    return t ? t : null;
  };
  const whatWell = clean(data.what_went_well);
  const whatHard = clean(data.what_went_hard);
  const tip = clean(data.tip_for_successors);
  const hasAnyFreeText = whatWell || whatHard || tip;

  const { error } = await supabase.from("reviews").insert({
    reviewer_account_id: account.id,
    group_id: data.group_id,
    listing_id: data.listing_id ?? null,
    supervisor_id: null,
    thesis_type: data.thesis_type,
    year_started: data.year_started,
    year_ended: data.year_ended,
    supervision_quality: data.supervision_quality,
    responsiveness: data.responsiveness,
    timeline_realism: data.timeline_realism,
    project_delivered: data.project_delivered,
    would_recommend: data.would_recommend,
    promotion_status: data.promotion_status,
    weekly_hours: data.weekly_hours,
    publication_outcome: data.publication_outcome,
    funding_as_promised: data.funding_as_promised,
    what_went_well: whatWell,
    what_went_hard: whatHard,
    tip_for_successors: tip,
    free_text: null,  // alter, unstrukturierter Freitext bleibt deprecated
    // Strukturierte Freitexte: gehen alle in dieselbe Moderations-Pipeline.
    free_text_status: hasAnyFreeText
      ? (flags.REVIEW_FREE_TEXT_ENABLED ? "pending_moderation" : "none")
      : "none",
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
