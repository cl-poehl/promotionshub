/**
 * Feature-Flags.
 *
 * Wichtigster Flag: NAMED_RATINGS_PUBLIC. Steuert Phase 2.
 * Default OFF. Erst nach (1) Haftungsvehikel, (2) anwaltlicher Einmal-Prüfung,
 * (3) erfolgreicher Phase-1-Validierung umschalten.
 *
 * Siehe Spezifikation §1 (Build-Phasen) und §2 (Architektur-Prinzipien).
 */

function flag(envKey: string, defaultValue: boolean): boolean {
  const raw = process.env[envKey];
  if (raw === undefined) return defaultValue;
  return raw === "1" || raw.toLowerCase() === "true";
}

export const flags = {
  /** Phase 2: Öffentliche namentliche Betreuer-Scores sichtbar machen. */
  NAMED_RATINGS_PUBLIC: flag("NAMED_RATINGS_PUBLIC", false),

  /** Phase 3: Hervorgehobene (bezahlte) Listings im Suchergebnis erlauben. */
  LISTING_PROMOTION_ENABLED: flag("LISTING_PROMOTION_ENABLED", false),

  /** Phase 3: Residenz-/Recruiting-Anzeigen aktivieren. */
  RECRUITING_ADS_ENABLED: flag("RECRUITING_ADS_ENABLED", false),

  /** Phase 3: Studierenden-Premium-Tier aktivieren. */
  STUDENT_PREMIUM_ENABLED: flag("STUDENT_PREMIUM_ENABLED", false),

  /** Optionaler Freitext im Erfahrungsbericht. §12 offene Entscheidung. */
  REVIEW_FREE_TEXT_ENABLED: flag("REVIEW_FREE_TEXT_ENABLED", true),
} as const;

export type FeatureFlags = typeof flags;
