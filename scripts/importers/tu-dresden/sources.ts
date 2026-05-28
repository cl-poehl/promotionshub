/**
 * TU-Dresden-Quellen (Stand 2026-05).
 *
 * Recherchiert aus den Klinikseiten unter https://www.uniklinikum-dresden.de/.
 * Der Importer ist idempotent — bei Änderungen einfach hier anpassen
 * und `npm run import:tu-dresden` erneut laufen lassen.
 *
 * Klassifizierung:
 *   • SUBSTANTIELLE QUELLEN: Klinik veröffentlicht Forschungsschwerpunkte
 *     und/oder konkrete Themen + Kontakt. Listings pro Bereich.
 *   • KONTAKT-HINWEIS: Klinik hat kein öffentliches Doktoranden-Portal,
 *     bietet aber im Rahmen ihrer Forschung Promotionen an.
 *     Ein Listing mit klarem „direkt anfragen"-Hinweis.
 *
 * NICHT enthalten (nicht für Dr. med. relevant):
 *   - Cochlear-Implant-Centrum (SCIC)
 *   - Klinik-Apotheke
 *   - Kieferorthopädie, Parodontologie, Zahnärztliche Prothetik
 *     (Dr. med. dent. — andere Promotionsordnung)
 */

import type { ImporterSource } from "../types";

const TU_DRESDEN_ID = "88888888-8888-8888-8888-888888888888";

// Allgemeiner Kontakt-Hinweis-Text — wird für Kliniken ohne öffentliches Portal genutzt.
const KONTAKT_HINWEIS = (klinik: string) =>
  `Diese Klinik bietet im Rahmen ihrer Forschung Doktorarbeit-Möglichkeiten an, betreibt aber kein öffentliches Verzeichnis offener Themen. Bitte direkt anfragen — Forschungsschwerpunkte siehe Klinik-Website.`;

export const tuDresdenSources: ImporterSource[] = [
  // ============================================================
  // SUBSTANTIELLE QUELLEN
  // ============================================================
  {
    slug: "ukd-vtg",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Viszeral-, Thorax- und Gefäßchirurgie (UKD)",
    specialty: "Chirurgie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/vtg",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/vtg/studium_Weiterbildung/moeglichkeiten-einer-medizinische-doktorarbeit",
    applicationContact: "Doktoranden-VTG@uniklinikum-dresden.de",
    researchAreas: [
      {
        title: "Klinische Studien (VTG-Chirurgie, UKD Dresden)",
        description:
          "Mitarbeit an klinischen Studien der Viszeral-, Thorax- und Gefäßchirurgie. Auswertung prospektiv und retrospektiv erhobener Patient:innendaten, Studienkoordination. Ansprechpartnerin: Dr. rer. nat. Sarah Zippusch.",
        thesis_type: "clinical",
      },
      {
        title: "Digitalisierung in der Medizin / Apps (VTG-Chirurgie, UKD Dresden)",
        description:
          "Doktorarbeiten zu digitalen Gesundheitsanwendungen in der Chirurgie — von Patient:innen-Apps bis zu klinischen Entscheidungssystemen. Bewerbung mit Motivationsschreiben.",
        thesis_type: "clinical",
      },
      {
        title: "Tumorimmunologie (VTG-Chirurgie, UKD Dresden)",
        description:
          "Experimentelle Doktorarbeit in der Tumorimmunologie. Laborzeit erforderlich; geeignet für Studierende mit Interesse an translationaler Forschung.",
        thesis_type: "experimental",
      },
      {
        title: "Gastrointestinale Tumor- und Stammzellbiologie (VTG-Chirurgie, UKD Dresden)",
        description:
          "Experimentelle Promotion in der Forschung zu gastrointestinalen Tumoren und Stammzellen. Zellkultur, molekularbiologische Methoden.",
        thesis_type: "experimental",
      },
      {
        title: "Inselzellforschung und -transplantation (VTG-Chirurgie, UKD Dresden)",
        description:
          "Experimentelle Doktorarbeit mit Schwerpunkt auf Pankreas-Inselzellen und Transplantationsforschung. Etablierte Laborgruppe.",
        thesis_type: "experimental",
      },
      {
        title: "Molekulare Marker der Aneurysmaentstehung (VTG-Chirurgie, UKD Dresden)",
        description:
          "Experimentelle Arbeit zu Mechanismen der Aneurysmagenese auf molekularer Ebene.",
        thesis_type: "experimental",
      },
      {
        title: "Minimalinvasive Chirurgie (VTG-Chirurgie, UKD Dresden)",
        description:
          "Klinische Doktorarbeit im Bereich der minimalinvasiven Chirurgie — z.B. Outcome-Auswertungen, Methoden-Vergleiche.",
        thesis_type: "clinical",
      },
    ],
  },
  {
    slug: "ukd-gyn",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Frauenheilkunde und Geburtshilfe (UKD)",
    specialty: "Gynäkologie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/gyn",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/gyn/lehre/studierende/promotionen",
    applicationContact: "gyn.promotion@uniklinikum-dresden.de",
    researchAreas: [
      {
        title: "Geburtshilfe / Pränatalmedizin (Frauenklinik, UKD Dresden)",
        description:
          "Klinische und retrospektive Datenanalyse-Arbeiten im Bereich Geburtshilfe und Pränatalmedizin. Betreuung: Dr. med. J. Winkler.",
        thesis_type: "clinical",
      },
      {
        title: "Reproduktionsmedizin / gynäkologische Endokrinologie (UKD Dresden)",
        description:
          "Promotion zu Themen der Reproduktionsmedizin und gynäkologischen Endokrinologie. Betreuung: PD Dr. med. M. Goeckenjan.",
        thesis_type: "clinical",
      },
      {
        title: "Onkologische Forschung (Labor) – Frauenklinik UKD Dresden",
        description:
          "Experimentelle Promotion im onkologischen Forschungslabor der Frauenklinik. Laborzeit erforderlich. Betreuung: Prof. Dr. J. Kuhlmann.",
        thesis_type: "experimental",
      },
      {
        title: "Retrospektive Datenanalysen Gynäkologie (UKD Dresden)",
        description:
          "Statistische Doktorarbeiten auf Basis von Patient:innen-Daten der Frauenklinik. Gut neben dem Studium machbar.",
        thesis_type: "statistical",
      },
    ],
  },
  {
    slug: "ukd-psy",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Psychiatrie und Psychotherapie (UKD)",
    specialty: "Psychiatrie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/stellenausschreibung-und-promotionen",
    applicationContact: "kerstin.schlese@tu-dresden.de",
    researchAreas: [
      {
        title: "Affektive Erkrankungen (Psychiatrie UKD Dresden)",
        description:
          "Doktorarbeit zu affektiven Erkrankungen (Depression, bipolare Störungen). Klinische Datenanalyse oder neurobiologische Fragestellungen.",
        thesis_type: "clinical",
      },
      {
        title: "Neurobiologie psychischer Störungen (Psychiatrie UKD Dresden)",
        description:
          "Experimentelle/neurobiologische Promotion. Etablierte Forschungsgruppe, Laborzeit erforderlich.",
        thesis_type: "experimental",
      },
      {
        title: "Suchterkrankungen (Psychiatrie UKD Dresden)",
        description:
          "Klinische oder verhaltensexperimentelle Doktorarbeit zur Suchtforschung.",
        thesis_type: "clinical",
      },
      {
        title: "Suizidprävention (Psychiatrie UKD Dresden)",
        description:
          "Versorgungs- oder Interventionsforschung im Bereich Suizidprävention.",
        thesis_type: "clinical",
      },
      {
        title: "Psychiatrische Epidemiologie und Versorgungsforschung (UKD Dresden)",
        description:
          "Statistische Doktorarbeit auf Basis epidemiologischer oder Versorgungsdaten.",
        thesis_type: "statistical",
      },
      {
        title: "Precision Psychiatry (UKD Dresden)",
        description:
          "Doktorarbeit im Bereich Präzisionspsychiatrie — Biomarker, individualisierte Therapie.",
        thesis_type: "experimental",
      },
      {
        title: "Alterserkrankungen und Demenz (Psychiatrie UKD Dresden)",
        description:
          "Klinische oder neurobiologische Doktorarbeit zu Demenzerkrankungen.",
        thesis_type: "clinical",
      },
      {
        title: "Systemische Neurowissenschaften (Psychiatrie UKD Dresden)",
        description:
          "Experimentelle/bildgebende Forschung im Bereich systemische Neurowissenschaften.",
        thesis_type: "experimental",
      },
    ],
  },
  {
    slug: "ukd-pso",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Psychotherapie und Psychosomatik (UKD)",
    specialty: "Psychosomatik / Psychotherapie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/pso",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/pso/forschung-und-lehre/angebote-fuer-abschlussarbeiten-promotionen",
    applicationContact: null,
    researchAreas: [
      {
        title: "Psychobiologie von Stress: parentale psychische Gesundheit (UKD Dresden)",
        description:
          "Forschung zu Zusammenhängen zwischen elterlicher psychischer Gesundheit (z.B. perinatale Depression) und biologischen Stressmarkern um die Geburt. Themen für Masterarbeiten und Promotionen vorhanden. Kontakt: Yvonne Friedrich.",
        thesis_type: "experimental",
      },
      {
        title: "Peripartale und Familienpsychosomatik (UKD Dresden)",
        description:
          "Untersuchung von Prädiktoren psychotherapeutischer Outcomes in einer Mutter-Kind-Tagesklinik. Master- und Promotionsthemen. Kontakt: Yvonne Friedrich.",
        thesis_type: "clinical",
      },
      {
        title: "Trauma, Epigenetik & Stressbiologie (UKD Dresden)",
        description:
          "Promotionsprojekt an der Schnittstelle peripartaler/familiärer Psychosomatik und Mutter-Kind-Tagesklinik. Bewerbung möglich für abgeschlossenes Studium (Psychologie, Medizin, Biologie o.ä.). Sehr gute Deutsch- und Englischkenntnisse erforderlich.",
        thesis_type: "experimental",
      },
    ],
  },
  {
    slug: "ukd-psm",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Psychosoziale Medizin und Entwicklungsneurowissenschaften (UKD)",
    specialty: "Entwicklungsneurowissenschaften",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psm",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psm/Karriere/Doktoranden",
    applicationContact: null,
    researchAreas: [
      {
        title: "Angewandte Entwicklungsneurowissenschaften (UKD Dresden)",
        description:
          "Promotion im Bereich angewandte Entwicklungsneurowissenschaften. Leitung: Prof. Dr. med. Stefan Ehrlich, Ph.D. Sekretariat: Kathrin Görler, Tel. 0351 458-4099.",
        thesis_type: "experimental",
      },
      {
        title: "Medizinische Psychologie und Soziologie (UKD Dresden)",
        description:
          "Promotionen in Medizinischer Psychologie und Medizinischer Soziologie. Sekretariat Kathrin Görler.",
        thesis_type: "clinical",
      },
      {
        title: "Lehr- und Lernforschung Medizin (UKD Dresden)",
        description:
          "Doktorarbeit im Bereich medizinische Lehr- und Lernforschung.",
        thesis_type: "statistical",
      },
    ],
  },
  {
    slug: "ukd-oupc",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Orthopädie, Unfall- und Plastische Chirurgie (UKD)",
    specialty: "Orthopädie / Unfallchirurgie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/oupc",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/oupc/forschung/promotion",
    applicationContact: null,
    researchAreas: [
      {
        title: "Experimentelle Forschung (Orthopädie/Unfallchirurgie UKD Dresden)",
        description:
          "Experimentelle Doktorarbeit — z.B. biomechanische Forschung, Prüfstandentwicklung, Grundlagen orthopädischer Erkrankungen. Anfrage über das klinikeigene Formular (siehe Quelle).",
        thesis_type: "experimental",
      },
      {
        title: "Klinische Studien (Orthopädie/Unfallchirurgie UKD Dresden)",
        description:
          "Klinische Doktorarbeit im Bereich Orthopädie, Unfall- und Plastische Chirurgie. Anfrage über das klinikeigene Formular.",
        thesis_type: "clinical",
      },
      {
        title: "Plastische und Handchirurgie — Promotionsangebote (UKD Dresden)",
        description:
          "Spezifische Promotionsangebote der Plastischen Chirurgie. Betreuung über Sekretariate (Frau von Burski / Frau Oestreich). Bewerbung über das Klinik-Formular.",
        thesis_type: "clinical",
      },
    ],
  },
  {
    slug: "ukd-neurochirurgie",
    universityId: TU_DRESDEN_ID,
    groupName: "Klinik und Poliklinik für Neurochirurgie (UKD)",
    specialty: "Neurochirurgie",
    publicUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurochirurgie",
    sourceUrl:
      "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurochirurgie",
    applicationContact: null,
    researchAreas: [
      {
        title: "AG Tumorimmunologie (Neurochirurgie UKD Dresden)",
        description:
          "Experimentelle Promotion in der Tumorimmunologie. Bitte direkt an die Klinik wenden (Tel. 0351 458-0).",
        thesis_type: "experimental",
      },
      {
        title: "AG Translationale Neuroonkologie und Schädelbasistumoren (UKD Dresden)",
        description:
          "Translationale Forschung zu Schädelbasistumoren. Kontaktaufnahme direkt mit der Klinik.",
        thesis_type: "experimental",
      },
      {
        title: "AG Translationale Bildgebung in der Neurochirurgie (UKD Dresden)",
        description:
          "Bildgebungsforschung in der Neurochirurgie. Kontakt direkt über die Klinik.",
        thesis_type: "experimental",
      },
    ],
  },

  // ============================================================
  // KONTAKT-HINWEIS (kein öffentliches Portal identifiziert)
  // ============================================================
  ...(
    [
      { slug: "ukd-hno",          name: "Klinik und Poliklinik für Hals-, Nasen- und Ohrenheilkunde (UKD)",   specialty: "HNO",                       path: "hno" },
      { slug: "ukd-der",          name: "Klinik und Poliklinik für Dermatologie (UKD)",                       specialty: "Dermatologie",              path: "der" },
      { slug: "ukd-augen",        name: "Klinik und Poliklinik für Augenheilkunde (UKD)",                     specialty: "Ophthalmologie",            path: "augenheilkunde" },
      { slug: "ukd-str",          name: "Klinik und Poliklinik für Strahlentherapie und Radioonkologie (UKD)", specialty: "Strahlentherapie",         path: "str" },
      { slug: "ukd-nuk",          name: "Klinik und Poliklinik für Nuklearmedizin (UKD)",                     specialty: "Nuklearmedizin",            path: "nuk" },
      { slug: "ukd-neurologie",   name: "Klinik und Poliklinik für Neurologie (UKD)",                         specialty: "Neurologie",                path: "neurologie" },
      { slug: "ukd-uro",          name: "Klinik und Poliklinik für Urologie (UKD)",                           specialty: "Urologie",                  path: "uro" },
      { slug: "ukd-mk1",          name: "Medizinische Klinik und Poliklinik I (UKD)",                         specialty: "Innere Medizin (MK1)",      path: "mk1" },
      { slug: "ukd-mk3",          name: "Medizinische Klinik und Poliklinik III (UKD)",                       specialty: "Innere Medizin (MK3)",      path: "mk3" },
      { slug: "ukd-ane",          name: "Klinik und Poliklinik für Anästhesiologie und Intensivtherapie (UKD)", specialty: "Anästhesiologie",         path: "ane" },
      { slug: "ukd-kik",          name: "Klinik und Poliklinik für Kinder- und Jugendmedizin (UKD)",          specialty: "Pädiatrie",                 path: "kik" },
      { slug: "ukd-kch",          name: "Klinik und Poliklinik für Kinderchirurgie (UKD)",                    specialty: "Kinderchirurgie",           path: "kch" },
      { slug: "ukd-kjp",          name: "Klinik und Poliklinik für Kinder- und Jugendpsychiatrie und -psychotherapie (UKD)", specialty: "Kinder- und Jugendpsychiatrie", path: "kjp" },
      { slug: "ukd-mkg",          name: "Klinik und Poliklinik für Mund-, Kiefer- und Gesichtschirurgie (UKD)", specialty: "MKG-Chirurgie",            path: "klinik-und-poliklinik-fuer-mund-kiefer-und-gesichtschirurgie" },
      { slug: "ukd-rad",          name: "Institut und Poliklinik für Diagnostische und Interventionelle Radiologie (UKD)", specialty: "Radiologie",     path: "rad" },
      { slug: "ukd-nra",          name: "Institut für Neuroradiologie (UKD)",                                 specialty: "Neuroradiologie",           path: "nra" },
      { slug: "ukd-pat",          name: "Institut für Pathologie (UKD)",                                      specialty: "Pathologie",                path: "pat" },
      { slug: "ukd-klinchem",     name: "Institut für Klinische Chemie und Laboratoriumsmedizin (UKD)",       specialty: "Klinische Chemie",          path: "klinische-chemie-und-laboratoriumsmedizin" },
      { slug: "ukd-kge",          name: "Institut für Klinische Genetik (UKD)",                               specialty: "Humangenetik",              path: "kge" },
      { slug: "ukd-mikrobio",     name: "Institut für Medizinische Mikrobiologie und Virologie (UKD)",        specialty: "Mikrobiologie / Virologie", path: "institut-fuer-medizinische-mikrobiologie-und-virologie" },
      { slug: "ukd-infekt",       name: "Klinische Infektiologie und Krankenhaushygiene (UKD)",               specialty: "Infektiologie",             path: "klinische-infektiologie" },
    ] as const
  ).map<ImporterSource>((c) => {
    const url = `https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/${c.path}`;
    return {
      slug: c.slug,
      universityId: TU_DRESDEN_ID,
      groupName: c.name,
      specialty: c.specialty,
      publicUrl: url,
      sourceUrl: url,
      applicationContact: null,
      researchAreas: [
        {
          title: `Doktorarbeit-Anfrage — ${c.name.replace(" (UKD)", "")}`,
          description: `${KONTAKT_HINWEIS(c.name)}\n\nFachgebiet: ${c.specialty}. UKD-Zentrale: 0351 458-0.`,
          thesis_type: "other",
          funding: "unknown",
        },
      ],
    };
  }),
];
