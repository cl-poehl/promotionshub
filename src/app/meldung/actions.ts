"use server";

import { z } from "zod";

import { DATA_MODE } from "@/lib/data";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { uuidish } from "@/lib/validation";

const ComplaintInput = z.object({
  target_review_id: uuidish("Ungültige Bericht-ID"),
  type: z.enum(["factual_dispute", "insult", "other"]),
  claim_text: z.string().trim().min(20, "Bitte beschreibe den Vorwurf konkreter.").max(5000),
  complainant_contact: z.string().trim().min(5).max(300),
});

export async function submitComplaintAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (DATA_MODE === "mock") {
    return { ok: false, error: "Im Dev-Modus deaktiviert. Bitte Supabase konfigurieren." };
  }

  const parsed = ComplaintInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("complaints").insert({
    target_review_id: data.target_review_id,
    type: data.type,
    claim_text: data.claim_text,
    complainant_contact: data.complainant_contact,
    state: "received",
    received_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };

  // §7: betroffenen Bericht auf 'under_review' setzen, bis das Verfahren
  // entschieden ist. Service-Rolle umgeht RLS.
  try {
    const admin = createSupabaseServiceClient();
    await admin
      .from("reviews")
      .update({ status: "under_review" })
      .eq("id", data.target_review_id);
  } catch {
    // Service-Key nicht konfiguriert — kein harter Fehler für die einreichende Person.
  }

  return { ok: true };
}
