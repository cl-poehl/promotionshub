"""
Liefert pro Klinik eine kompakte Übersicht aller gecrawlten Sub-Pages:
Titel, Größe in Zeichen, ob sie wahrscheinlich eine echte AG/Forschungs-
Page ist (Heuristik: keine reine Nav-Seite, hat Header H1, enthält
Forschungs-Stichworte).

Aufruf:
    python summarize.py --slug mk1
    python summarize.py            # alle
"""

import argparse
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
OUTPUT = HERE / "output"

NOISE_PATTERNS = {
    "anmelden", "sitemap", "kontakt", "impressum", "datenschutz",
    "ambulanz", "sprechstunden", "mitarbeiter", "stellenausschreibung",
    "aktuelles", "termine", "publikationen", "aktuell", "media",
    "ansprechpartner", "service",
}
YEAR_PATTERN = re.compile(r"^\d{4}$")


def is_noise(filename: str) -> bool:
    stem = Path(filename).stem.lower()
    if YEAR_PATTERN.match(stem):
        return True
    if stem in NOISE_PATTERNS:
        return True
    return False


def extract_main_content(md: str) -> tuple[str, int]:
    """
    Erste H1 als Titel; alles nach der ersten H1 bis zur nächsten H1 oder
    bis 1000 Zeichen vor Footer-Pattern als 'Body' (vereinfacht).
    """
    h1 = re.search(r"^# (.+)$", md, re.M)
    title = h1.group(1).strip() if h1 else ""
    body = md[h1.end():] if h1 else md
    # Footer-Cutoff
    cutoff_keys = ["Universitätsklinikum Carl Gustav Carus", "Sitemap", "© "]
    for k in cutoff_keys:
        idx = body.find(k)
        if idx > 0:
            body = body[:idx]
            break
    body = body.strip()
    # Roh-Char-Count (vor weiterer Bereinigung)
    return title, len(body)


def summarize_clinic(slug: str) -> dict:
    folder = OUTPUT / slug
    if not folder.exists():
        return {"slug": slug, "error": "no output"}
    pages = []
    for md in sorted(folder.glob("*.md")):
        if md.name == "__index__.md":
            continue
        if is_noise(md.name):
            continue
        text = md.read_text(encoding="utf-8")
        # url + title from comment header
        url_m = re.search(r"<!-- url: (.+?) -->", text)
        title_h = re.search(r"<!-- title: (.+?) -->", text)
        main_title, body_len = extract_main_content(text)
        pages.append({
            "file": md.name,
            "header_title": (title_h.group(1).strip() if title_h else None),
            "main_title": main_title,
            "url": url_m.group(1).strip() if url_m else None,
            "body_chars": body_len,
        })
    return {"slug": slug, "n_pages": len(pages), "pages": pages}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug")
    ap.add_argument("--min-chars", type=int, default=300,
                    help="nur Seiten mit mind. so vielen Body-Chars zeigen")
    args = ap.parse_args()

    slugs = [args.slug] if args.slug else sorted(p.name for p in OUTPUT.iterdir() if p.is_dir())

    out = {}
    for s in slugs:
        sum_ = summarize_clinic(s)
        # Filter dünne Seiten
        if "pages" in sum_:
            sum_["pages"] = [p for p in sum_["pages"] if p["body_chars"] >= args.min_chars]
            sum_["n_substantive"] = len(sum_["pages"])
        out[s] = sum_

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
