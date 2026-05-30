/**
 * Quiz-Kategorien für „Find your thesis".
 *
 * Eine Kategorie matched ein Listing, wenn:
 *   - die `groups.specialty` in der Whitelist steht, ODER
 *   - die Beschreibung mindestens eines der Keywords enthält.
 *
 * Cross-cutting (z.B. „Onkologie") braucht keine eigene specialty —
 * die Keywords finden die Tumor-AGs in Innerer, Dermatologie, Genetik usw.
 */

export type InterestCategory = {
  key: string;
  label: string;
  description: string;
  specialties: string[];
  keywords: string[];
};

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    key: "innere_medizin",
    label: "Innere Medizin",
    description: "Kardiologie, Diabetes, Hämatologie, Gastro, Nephrologie, Rheuma, Intensivmedizin",
    specialties: ["Innere Medizin (MK1)", "Innere Medizin (MK3)", "Anästhesiologie"],
    keywords: [
      "Hämatolog", "Gastroenterolog", "Nephrolog", "Rheumatolog", "Pneumolog",
      "Diabetes", "Stoffwechsel", "Inselzell", "Lebertransplant",
      "Gefäßendothel", "Kardio", "Lipid", "Lipoprotein",
      "ARDS", "Intensiv", "Sepsis",
    ],
  },
  {
    key: "onkologie",
    label: "Onkologie & Tumorforschung",
    description: "Krebsforschung in allen Disziplinen — Klinik, Labor und Bildgebung",
    specialties: [],
    keywords: [
      "Onkolog", "onkolog", "Tumor", "tumor", "Karzinom", "karzinom",
      "Krebs", "Leukämi", "Lymphom", "MDS", "Myelodysplast",
      "Glioblast", "Gliome", "Melanom", "AML", "CLL",
      "Brustkrebs", "Eierstockkrebs", "BRCA", "Strahlen", "Radio­onkolog",
    ],
  },
  {
    key: "chirurgie",
    label: "Chirurgie & operative Fächer",
    description: "Allgemein-/Visceral-/Gefäß-, Ortho/Unfall, Neuro-, MKG, Kinder, Urologie",
    specialties: [
      "Chirurgie", "Orthopädie / Unfallchirurgie", "Neurochirurgie",
      "MKG-Chirurgie", "Kinderchirurgie", "Urologie",
    ],
    keywords: [
      "chirurgisch", "Operation", "OP-", "minimalinvasiv", "Implantat",
      "Resektion", "Rekonstruktion", "Fraktur", "Knochen",
      "Aneurysm", "Lippen-Kiefer-Gaumen",
    ],
  },
  {
    key: "neuro_psyche",
    label: "Hirn, Nerven & Psyche",
    description: "Neurologie, Neurochirurgie, Neuroradiologie, Psychiatrie, Psychosomatik, KJP",
    specialties: [
      "Neurologie", "Neuroradiologie", "Neurochirurgie",
      "Psychiatrie", "Psychosomatik / Psychotherapie",
      "Kinder- und Jugendpsychiatrie", "Entwicklungsneurowissenschaften",
    ],
    keywords: [
      "Hirn", "neuronal", "ZNS", "neurolog", "neurobiolog",
      "Psych", "Depression", "Angst", "Trauma",
      "Schlaganfall", "Parkinson", "Multipl", "Demenz",
      "EEG", "MRT", "Cortex", "Mikroangiopathien", "MS",
    ],
  },
  {
    key: "frauen_kinder",
    label: "Frauen, Kinder & Familie",
    description: "Pädiatrie, Gynäkologie, Geburtshilfe, Mutter-Kind",
    specialties: [
      "Gynäkologie", "Pädiatrie", "Kinderchirurgie",
      "Kinder- und Jugendpsychiatrie",
    ],
    keywords: [
      "Schwangerschaft", "Kinder", "Jugend", "Frauenheilkunde",
      "Geburts", "peripartal", "Pädiatr", "Säugling",
      "Mutter-Kind", "Reproduktion",
    ],
  },
  {
    key: "diagnostik_labor",
    label: "Diagnostik, Labor & Bildgebung",
    description: "Pathologie, Klinische Chemie, Humangenetik, Mikrobio, Radiologie, Nuklearmedizin",
    specialties: [
      "Pathologie", "Klinische Chemie", "Humangenetik",
      "Mikrobiologie / Virologie", "Radiologie",
      "Neuroradiologie", "Nuklearmedizin", "Infektiologie",
    ],
    keywords: [
      "Diagnostik", "Bildgebung", "Sequenzierung", "NGS",
      "MRT", "PET", "CT", "Spektroskop", "Massenspektromet",
      "Metabolomik", "Proteomik", "Bioinformatik",
      "Biomarker", "Biobank", "MALDI",
    ],
  },
  {
    key: "sinnesorgane_haut",
    label: "Sinnesorgane & Haut",
    description: "HNO, Augenheilkunde, Dermatologie",
    specialties: ["HNO", "Ophthalmologie", "Dermatologie"],
    keywords: [
      "Haut", "Derm", "Auge", "Ophthal", "Glaukom", "Netzhaut",
      "Riech", "Schmeck", "Hör", "Cochlea", "HNO",
      "Allerg", "Atop",
    ],
  },
];

export function specialtyToCategoryKeys(specialty: string | null): string[] {
  if (!specialty) return [];
  return INTEREST_CATEGORIES.filter((c) => c.specialties.includes(specialty)).map((c) => c.key);
}
