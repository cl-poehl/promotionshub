"use server";

import { z } from "zod";

import { DATA_MODE } from "@/lib/data";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { uuidish } from "@/lib/validation";

const ListingInput = z.object({
  title: z.string().trim().min(10, "Titel zu kurz").max(200),
  description: z.string().trim().min(50, "Beschreibung zu kurz").max(5000),
  university_id: uuidish().optional().or(z.literal("")),
  group_id: uuidish().optional().or(z.literal("")),
  new_group_name: z.string().trim().min(2).max(200).optional().or(z.literal("")),
  thesis_type: z.enum(["experimental", "clinical", "statistical", "other"]),
  funding: z.enum(["paid", "stipend", "unpaid", "unknown"]),
  expected_duration_months: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .pipe(z.number().int().min(1).max(60).nullable()),
  application_contact: z.string().email(),
  agree: z.string().refine((v) => v === "on", "Bestätigung fehlt"),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitListingAction(formData: FormData): Promise<SubmitResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ListingInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  // Mock-Modus: kein DB-Zugriff. So tun, als wär’s gespeichert.
  if (DATA_MODE === "mock") {
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();

  // Falls eine neue Gruppe genannt ist, anlegen (nur wenn university_id existiert).
  // groups hat keine öffentliche INSERT-Policy (RLS), daher läuft die Anlage
  // über den Service-Role-Client. Sicher, weil serverseitig, validiert und der
  // einzige Weg. Eine Gruppe ohne veröffentlichtes Listing taucht nirgends auf,
  // bis das zugehörige (pending) Listing manuell freigegeben ist.
  let groupId = data.group_id || null;
  if (!groupId && data.new_group_name && data.university_id) {
    const admin = createSupabaseServiceClient();
    // Doppelanlage vermeiden: existiert die Gruppe (Name + Uni) schon?
    const { data: existingGroup } = await admin
      .from("groups")
      .select("id")
      .eq("university_id", data.university_id)
      .ilike("name", data.new_group_name)
      .maybeSingle();

    if (existingGroup) {
      groupId = existingGroup.id;
    } else {
      const { data: created, error } = await admin
        .from("groups")
        .insert({
          university_id: data.university_id,
          name: data.new_group_name,
          specialty: null,
          public_url: null,
        })
        .select("id")
        .single();
      if (error || !created) {
        return { ok: false, error: "Gruppe konnte nicht angelegt werden." };
      }
      groupId = created.id;
    }
  }

  if (!groupId) {
    return { ok: false, error: "Bitte Gruppe wählen oder neuen Gruppennamen + Universität angeben." };
  }

  const { error } = await supabase.from("listings").insert({
    group_id: groupId,
    supervisor_id: null,
    title: data.title,
    description: data.description,
    thesis_type: data.thesis_type,
    funding: data.funding,
    expected_duration_months: data.expected_duration_months,
    source: "submitted",
    application_contact: data.application_contact,
    status: "pending",
    promoted: false,
    promotion_expires_at: null,
    posted_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "Einreichung fehlgeschlagen." };

  return { ok: true };
}
