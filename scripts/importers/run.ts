/**
 * Generischer Importer-Runner.
 *
 * Nimmt eine Liste von ImporterSource, sichert Gruppen ab (per universityId+groupName),
 * und upsertet Listings idempotent. Dedup-Key: (group_id, title) — wenn dieselbe
 * Quelle erneut läuft, werden bestehende Einträge aktualisiert statt dupliziert.
 *
 * Aufruf z.B.: `npm run import:tu-dresden`
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

import type { ImporterSource } from "./types";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen in .env.local stehen.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function runImporter(label: string, sources: ImporterSource[]): Promise<void> {
  console.log(`\n— ${label}: ${sources.length} Quellen —`);

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalGroupsCreated = 0;

  for (const source of sources) {
    console.log(`\n• ${source.slug} (${source.groupName})`);

    // 1) Gruppe finden oder anlegen.
    let groupId: string;
    {
      const { data: existing } = await supabase
        .from("groups")
        .select("id")
        .eq("university_id", source.universityId)
        .eq("name", source.groupName)
        .maybeSingle();

      if (existing) {
        groupId = existing.id;
        // public_url + specialty aktualisieren, falls leer/anders
        await supabase
          .from("groups")
          .update({ specialty: source.specialty, public_url: source.publicUrl })
          .eq("id", groupId);
      } else {
        const { data: created, error } = await supabase
          .from("groups")
          .insert({
            university_id: source.universityId,
            name: source.groupName,
            specialty: source.specialty,
            public_url: source.publicUrl,
          })
          .select("id")
          .single();
        if (error || !created) {
          console.error(`  ✗ Gruppe konnte nicht angelegt werden: ${error?.message}`);
          continue;
        }
        groupId = created.id;
        totalGroupsCreated++;
        console.log(`  + Gruppe angelegt (${groupId})`);
      }
    }

    // 2) Listings upserten — eines pro Forschungsbereich.
    for (const area of source.researchAreas) {
      const { data: existingListing } = await supabase
        .from("listings")
        .select("id")
        .eq("group_id", groupId)
        .eq("title", area.title)
        .maybeSingle();

      const payload = {
        group_id: groupId,
        supervisor_id: null as string | null,
        title: area.title,
        description: `${area.description}\n\nQuelle: ${source.sourceUrl}`,
        thesis_type: area.thesis_type,
        funding: area.funding ?? "unknown",
        expected_duration_months: area.expected_duration_months ?? null,
        source: "scraped" as const,
        application_contact: source.applicationContact,
        status: "published" as const,
        promoted: false,
        promotion_expires_at: null as string | null,
      };

      if (existingListing) {
        const { error } = await supabase.from("listings").update(payload).eq("id", existingListing.id);
        if (error) {
          console.error(`  ✗ Update fehlgeschlagen: ${area.title} — ${error.message}`);
        } else {
          totalUpdated++;
          console.log(`  · aktualisiert: ${area.title}`);
        }
      } else {
        const { error } = await supabase.from("listings").insert({
          ...payload,
          posted_at: new Date().toISOString(),
        });
        if (error) {
          console.error(`  ✗ Insert fehlgeschlagen: ${area.title} — ${error.message}`);
        } else {
          totalInserted++;
          console.log(`  + neu: ${area.title}`);
        }
      }
    }
  }

  console.log(`\n— Fertig: ${totalInserted} neu, ${totalUpdated} aktualisiert, ${totalGroupsCreated} Gruppen neu —\n`);
}
