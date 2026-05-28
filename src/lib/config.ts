/**
 * Plattform-Konstanten. Werte mit ⚖️ sollten vor Phase-2-Launch
 * mit Anwalt bestätigt werden.
 */

/**
 * Mindestanzahl unabhängiger verifizierter Bewertungen, bevor ein
 * öffentlicher namentlicher Score angezeigt wird.
 *
 * ⚖️ §4 Schwellenwert-Regel. Default 4. Anpassbar per Env.
 */
export const MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE = Number(
  process.env.MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE ?? 4,
);

/**
 * Frist, innerhalb derer eine bestrittene Tatsachenbehauptung
 * durch die Bewertende Person substantiiert werden muss.
 *
 * ⚖️ §7 Notice-and-Takedown.
 */
export const TAKEDOWN_SUBSTANTIATION_WINDOW_DAYS = 14;

/** Likert-Dimensionen, in der Reihenfolge der Anzeige. */
export const REVIEW_DIMENSIONS = [
  {
    key: "supervision_quality",
    label: "Betreuungsqualität",
    prompt: "Wie gut hast du dich betreut gefühlt?",
  },
  {
    key: "responsiveness",
    label: "Erreichbarkeit",
    prompt: "Wie erreichbar war deine Betreuungsperson?",
  },
  {
    key: "timeline_realism",
    label: "Realismus des Zeitplans",
    prompt: "War der versprochene Zeitplan realistisch?",
  },
  {
    key: "project_delivered",
    label: "Datenlieferung",
    prompt: "Hat das Projekt verwertbare Daten/Ergebnisse geliefert?",
  },
  {
    key: "would_recommend",
    label: "Weiterempfehlung",
    prompt: "Würdest du diese Gruppe weiterempfehlen?",
  },
] as const;

export type ReviewDimensionKey = (typeof REVIEW_DIMENSIONS)[number]["key"];

export const THESIS_TYPES = [
  { key: "experimental", label: "Experimentell" },
  { key: "clinical", label: "Klinisch" },
  { key: "statistical", label: "Statistisch" },
  { key: "other", label: "Sonstige" },
] as const;

export const FUNDING_TYPES = [
  { key: "paid", label: "Vergütet" },
  { key: "stipend", label: "Stipendium" },
  { key: "unpaid", label: "Unvergütet" },
  { key: "unknown", label: "Unbekannt" },
] as const;
