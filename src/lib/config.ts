/**
 * Plattform-Konstanten. Werte mit ⚖️ sollten vor Phase-2-Launch
 * mit Anwalt bestätigt werden.
 */

/**
 * Mindestanzahl unabhängiger verifizierter Bewertungen, bevor ein
 * öffentlicher namentlicher BETREUER-Score (natürliche Person) angezeigt wird.
 *
 * ⚖️ §4 Schwellenwert-Regel — Schutz von Persönlichkeitsrechten.
 * Default 4. Anpassbar per Env. Hinter NAMED_RATINGS_PUBLIC-Flag.
 */
export const MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE = Number(
  process.env.MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE ?? 4,
);

/**
 * Mindestanzahl unabhängiger Bewertungen, bevor ein öffentlicher
 * GRUPPEN-/KLINIK-Score angezeigt wird.
 *
 * Gruppen/Kliniken sind juristische Einheiten, keine natürlichen
 * Personen — Persönlichkeitsrechte greifen nicht direkt. Wir setzen
 * trotzdem eine Untergrenze gegen Einzel-Vendetta-Risiko.
 *
 * ⚖️ Sollte vor öffentlichem Launch von einem Anwalt bestätigt werden.
 * Default 2. Anpassbar per Env.
 */
export const MIN_REVIEWS_FOR_GROUP_SCORE = Number(
  process.env.MIN_REVIEWS_FOR_GROUP_SCORE ?? 2,
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
    low: "ignoriert / kaum Treffen",
    high: "exzellente Betreuung",
  },
  {
    key: "responsiveness",
    label: "Erreichbarkeit",
    prompt: "Wie erreichbar war deine Betreuungsperson?",
    low: "Wochenlang keine Antwort",
    high: "Antwort meist binnen 1-2 Tagen",
  },
  {
    key: "timeline_realism",
    label: "Realismus des Zeitplans",
    prompt: "War der versprochene Zeitplan realistisch?",
    low: "Vielfach länger als angekündigt",
    high: "Wie versprochen oder schneller",
  },
  {
    key: "project_delivered",
    label: "Datenlieferung",
    prompt: "Hat das Projekt verwertbare Daten/Ergebnisse geliefert?",
    low: "Methodik scheiterte / kaum Daten",
    high: "Vollständige, verwertbare Daten",
  },
  {
    key: "would_recommend",
    label: "Weiterempfehlung",
    prompt: "Würdest du diese Gruppe einer Freundin / einem Freund weiterempfehlen?",
    low: "Auf keinen Fall",
    high: "Uneingeschränkt ja",
  },
] as const;

export type ReviewDimensionKey = (typeof REVIEW_DIMENSIONS)[number]["key"];

export const PROMOTION_STATUS = [
  { key: "ongoing", label: "Noch laufend" },
  { key: "completed", label: "Abgeschlossen" },
  { key: "discontinued", label: "Abgebrochen" },
] as const;

export const WEEKLY_HOURS = [
  { key: "fulltime", label: "Vollzeit (~35 h/Woche oder mehr)" },
  { key: "parttime_high", label: "Tageweise (15-35 h/Woche)" },
  { key: "parttime_low", label: "Wenige Stunden (< 15 h/Woche)" },
  { key: "occasional", label: "Nur in Blöcken / unregelmäßig" },
] as const;

export const PUBLICATION_OUTCOME = [
  { key: "first_author", label: "Erstautor:in-Publikation" },
  { key: "coauthor", label: "Co-Autor:in-Publikation" },
  { key: "mentioned", label: "Nur in Acknowledgments erwähnt" },
  { key: "none", label: "Keine Publikation" },
  { key: "in_progress", label: "Noch in Arbeit / eingereicht" },
] as const;

export const FUNDING_AS_PROMISED = [
  { key: "yes", label: "Ja, wie versprochen" },
  { key: "partial", label: "Teilweise / weniger als zugesagt" },
  { key: "no", label: "Nein, nicht eingehalten" },
  { key: "na", label: "Keine Förderung versprochen" },
] as const;

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
