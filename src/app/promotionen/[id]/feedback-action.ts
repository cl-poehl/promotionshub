"use server";

import { z } from "zod";

import { DATA_MODE } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidish } from "@/lib/validation";

const FEEDBACK_TYPES = [
  "no_longer_exists",
  "wrong_research_focus",
  "wrong_thesis_type",
  "wrong_contact",
  "outdated",
  "other",
] as const;

const FeedbackInput = z.object({
  listing_id: uuidish("Ungültige Listing-Referenz."),
  type: z.enum(FEEDBACK_TYPES, { error: "Bitte einen Grund wählen." }),
  description: z
    .string()
    .trim()
    .min(5, "Bitte beschreibe das Problem (mind. 5 Zeichen).")
    .max(2000, "Maximal 2000 Zeichen."),
  reporter_email: z
    .union([z.literal(""), z.string().trim().email("Ungültige E-Mail-Adresse.")])
    .transform((v) => (v === "" ? null : v))
    .optional()
    .nullable(),
});

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitListingFeedbackAction(formData: FormData): Promise<FeedbackResult> {
  if (DATA_MODE === "mock") {
    return { ok: false, error: "Im Dev-Modus deaktiviert. Bitte Supabase konfigurieren." };
  }

  const parsed = FeedbackInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listing_feedback").insert({
    listing_id: data.listing_id,
    type: data.type,
    description: data.description,
    reporter_email: data.reporter_email,
    state: "received",
  });

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  return { ok: true };
}
