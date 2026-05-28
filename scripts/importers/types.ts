/**
 * Importer-Typen. Eine ImporterSource repräsentiert eine Klinik/Institut,
 * die Promotionsmöglichkeiten anbietet. Daraus erzeugen wir N Listings.
 */

import type { ThesisType, FundingType } from "../../src/lib/supabase/types";

export type ResearchArea = {
  /** Sichtbarer Titel (wird zum Listing-Titel). */
  title: string;
  /** Mehrzeilige Beschreibung der Forschungsrichtung. */
  description: string;
  thesis_type: ThesisType;
  funding?: FundingType;
  expected_duration_months?: number;
  /** Per-AG-Kontakt (Email oder Tel.). Wenn null/undefined, fällt auf Source.applicationContact zurück. */
  applicationContact?: string | null;
  /** Per-AG-Quell-URL (z.B. AG-Subpage). Wenn null/undefined, Source.sourceUrl. */
  sourceUrl?: string | null;
};

export type ImporterSource = {
  /** Eindeutiger Slug zur Wiedererkennung beim Upsert. */
  slug: string;
  /** Universitäts-UUID, der die Klinik zugeordnet wird. */
  universityId: string;
  /** Name der Gruppe/Klinik wie in der DB (groups.name). */
  groupName: string;
  /** Optional: Spezialgebiet für groups.specialty (z.B. „Chirurgie"). */
  specialty: string;
  /** Öffentliche Seite der Klinik — landet als groups.public_url + listings.source_url. */
  publicUrl: string;
  /** Quell-Seite (Promotions-/Doktorarbeit-Unterseite). */
  sourceUrl: string;
  /** Allgemeine Bewerbungs-E-Mail der Klinik. `null` wenn keine bekannt — UI blendet den Kontakt-Block dann aus. */
  applicationContact: string | null;
  /** Forschungsbereiche → je 1 Listing. */
  researchAreas: ResearchArea[];
};
