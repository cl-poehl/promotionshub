/**
 * Deterministisches Matching: Quiz-Antworten → gerankte Listings.
 *
 * Score-Bestandteile pro Listing:
 *   - Interesse  (max 40): Klinik-Specialty matched + Keywords in Description
 *   - Methodik   (max 25): thesis_type passt zur Wet-Lab/Klinik/Daten-Präferenz
 *   - Zeit       (max 15): Beschreibung erwähnt passende Zeit­anforderung
 *   - Computing  (max 10): Comp-Skills vs. Anforderungen
 *   - Karriere   (max 10): strukturierte Programme vs. normale AG
 *   - Publikation (max 10): Hinweise auf Publikations­häufigkeit
 *
 * Maximum theoretisch: 110, praktisch ~80. Score wird normalisiert auf %.
 */

import type { ListingWithRelations } from "@/lib/data";
import { INTEREST_CATEGORIES, specialtyToCategoryKeys } from "./categories";

export type QuizAnswers = {
  /** Eines: experimental | clinical | statistical | mixed */
  methodPreference: "experimental" | "clinical" | "statistical" | "mixed";
  /** Eines: fulltime | parttime | minimal */
  timeAvailable: "fulltime" | "parttime" | "minimal";
  /** 1..n interest-category keys */
  interests: string[];
  /** Eines: none | learning | confident */
  computingSkills: "none" | "learning" | "confident";
  /** Eines: clinic | academic | industry | unsure */
  careerGoal: "clinic" | "academic" | "industry" | "unsure";
  /** Eines: low | medium | high */
  publicationImportance: "low" | "medium" | "high";
};

export type MatchResult = {
  listing: ListingWithRelations;
  score: number;       // 0-100
  reasons: string[];   // kurze „darum passt das"-Begründungen
};

function descIncludes(listing: ListingWithRelations, words: string[]): boolean {
  const text = listing.description.toLowerCase();
  return words.some((w) => text.includes(w.toLowerCase()));
}

function countKeywordHits(listing: ListingWithRelations, words: string[]): number {
  const text = listing.description.toLowerCase();
  return words.filter((w) => text.includes(w.toLowerCase())).length;
}

const FULLTIME_WORDS = ["vollzeit", "mehrere monate vollzeit", "monate vollzeit", "wet lab", "wetlab", "lab-meeting"];
const PARTTIME_WORDS = ["neben dem studium", "gut machbar", "klinikregister", "registerstudie", "datenanalyse", "retrospektiv"];

const COMP_WORDS = ["bioinformatik", "computational", "machine learning", "ml-", "big data", "ki", "algorithm", "python", "modellierung"];

const STRUCTURED_PROGRAMS = [
  "Dresden School of Clinical Science",
  "Mildred-Scheel-Nachwuchszentrum",
  "Else Kröner-Fresenius",
  "DIGS-ILS",
  "DSCS",
  "Carus Promotionskolleg",
];

const PUBLICATION_WORDS = ["erstautor", "publikation", "publiziert", "veröffentlicht", "manuscript", "first author"];

export function matchListings(
  listings: ListingWithRelations[],
  answers: QuizAnswers,
): MatchResult[] {
  const results: MatchResult[] = listings.map((listing) => {
    const reasons: string[] = [];
    let score = 0;

    // ----- 1. Interesse (max 40) -----
    let interestPoints = 0;
    for (const key of answers.interests) {
      const cat = INTEREST_CATEGORIES.find((c) => c.key === key);
      if (!cat) continue;
      const specialtyMatched =
        listing.group?.specialty &&
        specialtyToCategoryKeys(listing.group.specialty).includes(key);
      const keywordHits = countKeywordHits(listing, cat.keywords);
      if (specialtyMatched) {
        interestPoints += 25;
        reasons.push(`Fach „${cat.label}" passt direkt`);
      } else if (keywordHits >= 2) {
        interestPoints += 18;
        reasons.push(`Beschreibung trifft „${cat.label}" (${keywordHits} Treffer)`);
      } else if (keywordHits === 1) {
        interestPoints += 8;
      }
    }
    score += Math.min(40, interestPoints);

    // ----- 2. Methodik (max 25) -----
    const types = listing.thesis_types_offered ?? [listing.thesis_type];
    const methodMap = {
      experimental: ["experimental"],
      clinical: ["clinical"],
      statistical: ["statistical"],
      mixed: ["experimental", "clinical", "statistical"],
    } as const;
    const desiredTypes = methodMap[answers.methodPreference];
    const overlap = types.filter((t) => (desiredTypes as readonly string[]).includes(t));
    if (overlap.length > 0) {
      if (answers.methodPreference === "mixed" && overlap.length >= 2) {
        score += 25;
        reasons.push("Bietet mehrere Thesis-Typen");
      } else if (overlap.length >= 1) {
        score += 20;
        const labelMap: Record<string, string> = {
          experimental: "experimentell",
          clinical: "klinisch",
          statistical: "statistisch",
        };
        const labels = overlap.map((t) => labelMap[t]).join(" / ");
        reasons.push(`Methode passt (${labels})`);
      }
    }

    // ----- 3. Zeit (max 15) -----
    if (answers.timeAvailable === "fulltime") {
      if (descIncludes(listing, FULLTIME_WORDS)) {
        score += 15;
        reasons.push("Vollzeit-Phase passt");
      } else if (types.includes("experimental")) {
        score += 8; // experimentelle Arbeiten brauchen i.d.R. Vollzeit
      }
    } else if (answers.timeAvailable === "parttime") {
      if (descIncludes(listing, PARTTIME_WORDS)) {
        score += 15;
        reasons.push("Neben dem Studium machbar");
      } else if (types.includes("clinical") || types.includes("statistical")) {
        score += 8;
      }
    } else if (answers.timeAvailable === "minimal") {
      if (types.includes("statistical") && descIncludes(listing, ["register", "retrospektiv", "datenauswertung"])) {
        score += 12;
        reasons.push("Wenig Zeitaufwand möglich");
      } else if (types.includes("statistical")) {
        score += 6;
      }
    }

    // ----- 4. Computing (max 10) -----
    const hasComp = descIncludes(listing, COMP_WORDS);
    if (answers.computingSkills === "confident" && hasComp) {
      score += 10;
      reasons.push("Programmier-Kenntnisse werden genutzt");
    } else if (answers.computingSkills === "learning" && hasComp) {
      score += 7;
      reasons.push("Gute Gelegenheit, ML/Bioinformatik zu lernen");
    } else if (answers.computingSkills === "none" && hasComp) {
      score -= 5; // negativer Punkt: User möchte nicht programmieren
    }

    // ----- 5. Karriere (max 10) -----
    const isStructuredProgram = STRUCTURED_PROGRAMS.some((p) => listing.title.includes(p));
    if (answers.careerGoal === "academic" && isStructuredProgram) {
      score += 10;
      reasons.push("Strukturiertes akademisches Förderprogramm");
    } else if (answers.careerGoal === "academic" && types.includes("experimental")) {
      score += 3;
    } else if (answers.careerGoal === "clinic" && types.includes("clinical")) {
      score += 5;
    } else if (answers.careerGoal === "industry" && hasComp) {
      score += 5;
      reasons.push("Methoden, die auch in Industrie gefragt sind");
    }

    // ----- 6. Publikation (max 10) -----
    if (answers.publicationImportance === "high") {
      if (descIncludes(listing, PUBLICATION_WORDS)) {
        score += 10;
        reasons.push("Publikation explizit erwähnt");
      } else if (types.includes("experimental")) {
        score += 4;
      }
    } else if (answers.publicationImportance === "medium" && descIncludes(listing, PUBLICATION_WORDS)) {
      score += 5;
    }

    return {
      listing,
      score,
      reasons: reasons.slice(0, 4),
    };
  });

  // Normalisieren auf 0-100
  const maxScore = Math.max(...results.map((r) => r.score), 1);
  return results
    .map((r) => ({ ...r, score: Math.round((r.score / Math.max(maxScore, 60)) * 100) }))
    .filter((r) => r.score >= 30)
    .sort((a, b) => b.score - a.score);
}
