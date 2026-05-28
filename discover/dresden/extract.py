"""
Extrahiert pro Klinik den Body-Content (ohne Navigation/Footer) aller
substantiellen Sub-Pages und schreibt ein konsolidiertes JSON.

Output:
    extracted/<slug>.json   # Liste {file, title, url, body}

Body = vom ersten H1 bis vor den Footer-Boilerplate-Markern,
   getrimmt auf max. 4000 Zeichen.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
OUTPUT = HERE / "output"
EXTRACTED = HERE / "extracted"

NOISE_NAMES = {
    "anmelden", "sitemap", "kontakt", "impressum", "datenschutz",
    "mitarbeiter", "ansprechpartner", "ansprechpartner-innen",
    "termine", "famulatur", "famulaturen", "weiterbildung",
    "laborbereiche", "ambulanz", "sprechstunden", "klinische-studien",
    "aktuelle-klinische-studien", "aktuelle-studien",
    "aktuelles", "media",
    # Lehre-/Curriculum-Seiten, keine Forschungs-Inhalte
    "lehre", "lehre-und-forschung", "lehre-forschung", "lehrangebote",
    "studenten", "studierende", "pj", "praktisches-jahr", "blockpraktikum",
    "vorlesung", "vorlesungen", "famulanten", "famulatur-und-pj",
    "service", "downloads", "anfahrt", "aktuell",
    "uebersicht", "diese-seite-existiert-leider-nicht",
    "stellenanzeigen", "stellen", "stellenangebote", "weiterbildung-und-karriere",
}
YEAR_RE = re.compile(r"^\d{4}$")

FOOTER_MARKERS = [
    # Adressblöcke (whitespace-tolerant via \s+)
    r"Universitätsklinikum\s+Carl\s+Gustav\s+Carus",
    r"Fetscherstraße\s+74",
    r"Haus\s+\d+,?\s+Fetscherstraße",
    # Personal-/Mitarbeiter-Sektionen
    r"\bMitarbeiter\b[\s\n]*(?:Ärztliche|Nichtärztliche)",
    r"Mitarbeiter:innen[\s\n]*(?:Labor|Klinik)?:",
    r"Ärztliche\s+Mitarbeiter\*?innen:",
    r"Ärztliches\s+und\s+wissenschaftliches\s+Personal",
    # Selbst-Werbung / Karriere
    r"Stellenangebote",
    r"Wir\s+suchen\s+ständig",
    r"Sie\s+haben\s+Fragen\?",
    # Lehre-Abschnitte (gehören nicht in Forschungsbeschreibung)
    r"Lehrveranstaltungen\s+für\s+Medizinstudierende",
    r"Praktisches\s+Jahr",
    r"Famulatur",
    # Publikationslisten / Externe Links (sind nicht primär für Promotion relevant)
    r"Forschung\s+und\s+Publikationen\s*\(Auswahl\)",
    r"^Links\s*$",
    r"^Kooperationen\s*$",
    # Footer-Copyright
    r"©\s+Universitätsklinikum",
]
NAV_PREFIXES = ("Search Suche", "Website durchsuchen Suche", "Anmelden",
                "Patienten und Besucher", "Anfahrt", "Sie haben Fragen?")


def is_noise(fn: str) -> bool:
    stem = Path(fn).stem.lower()
    if YEAR_RE.match(stem):
        return True
    if stem in NOISE_NAMES:
        return True
    return False


def clean_body(md: str) -> tuple[str, str]:
    """Returns (title, body) — Plain-Text-tauglich, ohne Markdown-Müll."""
    h1 = re.search(r"^# (.+)$", md, re.M)
    title = h1.group(1).strip() if h1 else ""
    if not h1:
        return title, ""
    body = md[h1.end():]
    # Footer-/Boilerplate-Cutoff: erstes Match aller Marker gewinnt
    earliest = len(body)
    for pattern in FOOTER_MARKERS:
        m = re.search(pattern, body, re.M)
        if m and m.start() > 0 and m.start() < earliest:
            earliest = m.start()
    body = body[:earliest]
    # Zeilenweise filtern
    lines = []
    for line in body.splitlines():
        s = line.strip()
        if not s:
            lines.append("")
            continue
        if s.startswith(NAV_PREFIXES):
            continue
        # Skip Markdown-Image-Lines, Logo-Links etc.
        if re.match(r"^\!\[", s):
            continue
        if re.match(r"^\* \[\!\[", s):  # bullet pic-link
            continue
        # Pipe-Table-Separator-Zeilen (--- | ---) → komplett weg
        if re.match(r"^[|\s\-:]+$", s) and "-" in s:
            continue
        lines.append(line)
    body = "\n".join(lines)

    # Pipe-Table-Strukturen in lesbare Sätze auflösen:
    # `| cell1 | cell2 | cell3 |` → `cell1 — cell2 — cell3`
    def detable(m: re.Match) -> str:
        cells = [c.strip() for c in m.group(0).split("|") if c.strip()]
        return " — ".join(cells)
    body = re.sub(r"\|[^\n]+\|", detable, body)
    # Übriggebliebene Einzel-Pipes (z.B. "Leiterin | Prof. Dr.")
    body = re.sub(r"\s*\|\s*", ": ", body)
    # Mehrfache ": " hintereinander komprimieren
    body = re.sub(r"(?:: ){2,}", ": ", body)

    # Markdown-Bold/Italic in plain text wandeln
    body = re.sub(r"\*\*(.+?)\*\*", r"\1", body)  # **bold** → bold
    body = re.sub(r"(?<!\*)\*(?!\*)([^*\n]{2,80}?)(?<!\*)\*(?!\*)", r"\1", body)  # *italic*

    # Bullets → • (auch inline nach Punkt/Doppelpunkt, nicht nur am Zeilenanfang)
    body = re.sub(r"^(\s*)\* ", r"\1• ", body, flags=re.M)
    body = re.sub(r"(?<=[\s:.])\*\s+(?=[A-ZÄÖÜa-zäöü])", "• ", body)
    # Heading-Marker entfernen
    body = re.sub(r"^#{1,6}\s*", "", body, flags=re.M)

    # Whitespace-Komprimierung
    body = re.sub(r"[ \t]+", " ", body)
    body = re.sub(r" *\n *", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    # Trailing-Müll abschneiden: Bullet-/Punkt-/Klammer-Reste am Ende
    body = re.sub(r"[\s\*•·\-\[\]]*©[\s\S]*$", "", body)  # ab erstem © weg
    body = re.sub(r"[\s\*•·\-]+$", "", body).strip()      # trailing symbols
    # E-Mail-Captcha-Phrasen
    body = re.sub(r"\bE-Mail\s*\.?\s*$", "", body).strip()

    return title, body[:4000]


def process_clinic(slug: str) -> dict:
    folder = OUTPUT / slug
    if not folder.exists():
        return {"slug": slug, "pages": []}
    pages = []
    for md in sorted(folder.glob("*.md")):
        if md.name == "__index__.md" or is_noise(md.name):
            continue
        text = md.read_text(encoding="utf-8")
        url_m = re.search(r"<!-- url: (.+?) -->", text)
        url = url_m.group(1).strip() if url_m else ""
        title, body = clean_body(text)
        # Filter 404er
        if "Diese Seite existiert leider nicht" in body or len(body) < 200:
            continue
        # Filter Lehre-/Curriculum-Titel
        title_l = title.lower()
        if any(k in title_l for k in ("lehrangebote", "blockpraktikum", "vorlesung",
                                       "praktisches jahr", "pj-beauftrag", "ablauf praktikum",
                                       "famulatur", "stundenplan", "klausur",
                                       "schein", "studenten ", "studierende ",
                                       "ablauf", "anmeldung")):
            continue
        pages.append({
            "file": md.name,
            "url": url,
            "title": title,
            "body": body,
        })
    return {"slug": slug, "n_pages": len(pages), "pages": pages}


def main() -> None:
    EXTRACTED.mkdir(exist_ok=True)
    total = 0
    for d in sorted(p for p in OUTPUT.iterdir() if p.is_dir()):
        slug = d.name
        out = process_clinic(slug)
        (EXTRACTED / f"{slug}.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"  {slug:<18} {out['n_pages']:>3} pages")
        total += out["n_pages"]
    print(f"\n  TOTAL: {total} pages, output → {EXTRACTED}")


if __name__ == "__main__":
    main()
