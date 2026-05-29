"""
Klassifiziert die handpolierten MANUAL_OVERRIDES in drei Stufen:
  PERSON_NAMED: AG/Lab explizit nach einer einzelnen Person benannt
                (Persönlichkeitsrechte greifen, Rating ≈ Personenbewertung)
  TOPIC_AG:     AG-Titel beschreibt ein Forschungsfeld
                (gemischt — kann Personen im Subtitle erwähnen)
  INSTITUTION:  Klinik-/Zentrums-/Programm-Ebene, klar kollektiv

Heuristik:
- Titel-Pattern "<Surname> Lab" am Anfang oder nach "— "  → PERSON_NAMED
- Titel-Pattern "AG <Surname>" wo Surname KEIN Topic-Stichwort ist → PERSON_NAMED
- Titel-Pattern "<Surname>/<Surname>" (zwei Nachnamen) → PERSON_NAMED
- Titel mit Topic-Wörtern aber ohne Person-Pattern → TOPIC_AG
- Klinik-/Zentrums-Stichwörter → INSTITUTION
"""

import re
import sys

sys.path.insert(0, ".")
from build_sources import MANUAL_OVERRIDES  # type: ignore

# Topic-Stichwörter, die direkt nach "AG " stehen können
# (das Wort selbst beschreibt ein Forschungsfeld, nicht eine Person)
TOPIC_WORDS = {
    "AI", "Affektive", "Akute", "Allergologie", "Angewandte",
    "Bildgebung", "Computational", "Dermato", "Dermatoonkologische",
    "Diabetes", "Digitalisierung", "Dresden", "Dynamische",
    "Einflussfaktoren", "Entwicklungs", "Epidemiologie", "Experimentelle",
    "Forschung", "Forschungs", "Functional", "Gastrointestinale",
    "Geburtshilfe", "Hämatologie", "Hämorrhagische", "Hämostaseologie",
    "Hirntumore", "Improvements", "Inselzell", "Interventions",
    "Klinische", "Kognitive", "Kombinierte", "Lehr",
    "Lippen-Kiefer-Gaumen", "MDS", "MK1-L01", "MK1-L11", "MS-",
    "Mildred-Scheel", "Mikroangiopathien", "Minimalinvasive",
    "Molekulare", "Multiple", "Multimodale", "Myelodysplastische",
    "Nephrologie", "Neuroimmunologie", "Neurobiologie",
    "Neuromarker", "Onkologische", "PAIVS", "PSO", "Pädiatrische",
    "Peripartal", "Plastische", "Pneumo", "Post-Akute",
    "Psychiatrische", "Psychobiologie", "Psycho", "Psychotraumatologie",
    "Radiobiologie", "Reproduktions", "Retrospektive",
    "Schlaganfall", "Schlaganfälle", "Schädelbasis",
    "Stem", "Strahlen", "Such", "Suizid", "Systemische",
    "TxI", "Tic", "Tissue", "Translational", "Trauma",
    "Tumor", "Verlauf", "Versorgungs", "Übergreifende",
    "ADHS", "ADHD", "AKT",
}

INSTITUTIONAL_HINTS = {
    "Klinik", "Institut", "Forschungsmission", "Zentrum", "Centrum",
    "Universitäts", "Universität", "School", "Schule",
    "Studienzentrum", "Studien", "Carus", "DSCS", "Promotionskolleg",
    "Mildred-Scheel-Nachwuchszentrum", "EKFZ", "Else Kröner",
    "OncoRay", "transCampus", "ERN GENTURIS",
    "Konsiliarlabor", "Core Unit", "Core Facility",
    "DILB", "CMTD", "NCT", "Werkstoffkundelabor",
    "Methodenspektrum", "MIRD", "Risikoberechnung",
    "Antibiotic Stewardship", "Drittmittel",
}

# Bekannte Topic-Lab-Namen (Forschungsfeld + "Lab", kein Personen-Name)
TOPIC_LAB_NAMES = {
    "Stem Cell Lab", "Angiology Research Lab", "Translational Research",
    "Forschungslabor",
}

# Pattern: <Wort mit Großbuchstabe> Lab am Anfang oder hinter "— "
LAB_PATTERN = re.compile(
    r"(?:^|—\s*)([A-ZÄÖÜ][a-zäöüß]+(?:[-\s][A-ZÄÖÜ][a-zäöüß]+)?)\s+Lab\b"
)
# Pattern: "AG <Wort>"
AG_PATTERN = re.compile(r"^AG\s+([A-ZÄÖÜ][\w\-]+)")
# Pattern: "— <Nachname>/<Nachname>" oder Mehrnamenkombination
TWO_SURNAMES_PATTERN = re.compile(
    r"—\s*([A-ZÄÖÜ][a-zäöüß]+)/([A-ZÄÖÜ][a-zäöüß]+)"
)


def is_topic_word(word: str) -> bool:
    for tw in TOPIC_WORDS:
        if word == tw or word.startswith(tw):
            return True
    return False


def classify(title: str) -> tuple[str, str]:
    # 1. Lab-Pattern (höchste Priorität, weil "<Name> Lab" sehr eindeutig ist)
    for m in LAB_PATTERN.finditer(title):
        candidate = m.group(1).strip()
        # Filter Topic-Labs
        if any(t in candidate for t in TOPIC_LAB_NAMES) or candidate in TOPIC_LAB_NAMES:
            continue
        if is_topic_word(candidate):
            continue
        return ("PERSON_NAMED", f"'{candidate} Lab' in title")

    # 2. "<Name>/<Name>" Doppel-Nachname-Pattern
    m = TWO_SURNAMES_PATTERN.search(title)
    if m:
        n1, n2 = m.group(1), m.group(2)
        if not (is_topic_word(n1) or is_topic_word(n2)):
            return ("PERSON_NAMED", f"'{n1}/{n2}' two-surname pattern")

    # 3. AG-Pattern: erstes Wort nach "AG " analysieren
    m = AG_PATTERN.match(title)
    if m:
        word = m.group(1)
        if is_topic_word(word):
            return ("TOPIC_AG", f"'AG {word}' → topic")
        # Wort ist KEIN Topic → vermutlich Nachname
        return ("PERSON_NAMED", f"'AG {word}' (surname pattern)")

    # 4. Institutional?
    for kw in INSTITUTIONAL_HINTS:
        if kw in title:
            return ("INSTITUTION", f"contains {kw!r}")

    # 5. Default
    return ("INSTITUTION", "no person-naming pattern")


def main() -> None:
    by_cat: dict[str, list[tuple[str, str, str]]] = {
        "PERSON_NAMED": [],
        "TOPIC_AG": [],
        "INSTITUTION": [],
    }
    for slug, entries in MANUAL_OVERRIDES.items():
        for e in entries:
            cat, reason = classify(e["title"])
            by_cat[cat].append((slug, e["title"], reason))

    for cat in ("PERSON_NAMED", "TOPIC_AG", "INSTITUTION"):
        entries = sorted(by_cat[cat])
        print(f"\n=== {cat} ({len(entries)}) ===")
        for slug, title, reason in entries:
            print(f"  [{slug}] {title}")
            print(f"      → {reason}")

    print("\n--- SUMMARY ---")
    total = sum(len(v) for v in by_cat.values())
    for cat, entries in by_cat.items():
        pct = 100 * len(entries) / total if total else 0
        print(f"  {cat:<14} {len(entries):>3} ({pct:>4.1f} %)")


if __name__ == "__main__":
    main()
