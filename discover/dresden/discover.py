"""
TU-Dresden-AG-Discovery via crawl4ai.

Zweck: AG-Subpages, die auf den Klinik-Forschungs-Indexseiten verlinkt sind,
parallelisiert abgrasen und sauberes Markdown pro AG speichern. Der
Markdown-Output wird anschließend manuell (oder per LLM) in das
ImporterSource-Schema von scripts/importers/tu-dresden/sources.ts überführt.

Aufruf:
    python discover.py [--slug mk1] [--max 20]

Output:
    output/<slug>/__index__.md            # Klinik-Index-Seite
    output/<slug>/__links__.json          # extrahierte AG-Links
    output/<slug>/<ag-slug>.md            # je AG eine Markdown-Datei
"""

import argparse
import asyncio
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import yaml
from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

HERE = Path(__file__).parent
OUTPUT = HERE / "output"
SOURCES_FILE = HERE / "sources.yaml"

# Wir interessieren uns nur für AG-Sub-Links der Klinik. Heuristik:
# - Link bleibt im selben Klinik-Pfad (z.B. /mk1/...)
# - Link enthält "forschung", "research", "ag-", "lab", "fachabteilung"
LINK_KEYWORDS = ("forschung", "research", "ag-", "lab")


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:80] or "page"


def extract_internal_links(markdown_or_html: str, base_url: str, base_path: str) -> list[dict]:
    """
    Findet alle (text, url) Tupel innerhalb des Klinik-Pfades, die nach
    einer AG/Forschungs-Subpage aussehen. Dedupliziert.
    """
    seen: dict[str, str] = {}

    # Markdown-Links: [text](url)
    for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", markdown_or_html):
        text, href = m.group(1).strip(), m.group(2).strip()
        if not href or href.startswith("#") or href.startswith("mailto:"):
            continue
        absolute = urljoin(base_url, href)
        path = urlparse(absolute).path.lower()
        if not path.startswith(base_path):
            continue
        if absolute == base_url:
            continue
        if not any(k in path for k in LINK_KEYWORDS):
            continue
        # Skip langer Filter: nur "tiefe" Subpages (mehr Pfad-Segmente als Base)
        if path.count("/") <= base_path.count("/"):
            continue
        if absolute not in seen:
            seen[absolute] = text or path.rsplit("/", 1)[-1]

    return [{"url": u, "text": t} for u, t in seen.items()]


async def crawl_clinic(crawler: AsyncWebCrawler, slug: str, index_url: str, max_pages: int) -> dict:
    out_dir = OUTPUT / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    run_cfg = CrawlerRunConfig(cache_mode=CacheMode.ENABLED, stream=False)

    print(f"\n• [{slug}] Index: {index_url}")
    res = await crawler.arun(url=index_url, config=run_cfg)
    if not res.success:
        print(f"  ✗ Index-Fetch fehlgeschlagen: {res.error_message}")
        return {"slug": slug, "ok": False}

    (out_dir / "__index__.md").write_text(res.markdown or "", encoding="utf-8")

    base_path = urlparse(index_url).path.rsplit("/", 1)[0].lower() + "/"
    klinik_root = base_path.split("/forschung", 1)[0].split("/lehre", 1)[0]
    if not klinik_root.endswith("/"):
        klinik_root += "/"

    links = extract_internal_links(res.markdown or "", index_url, klinik_root)
    print(f"  · {len(links)} AG-Sub-Links entdeckt")

    links = links[:max_pages]
    (out_dir / "__links__.json").write_text(json.dumps(links, ensure_ascii=False, indent=2), encoding="utf-8")

    if not links:
        return {"slug": slug, "ok": True, "n_links": 0}

    # Bekannte Asset-Extensions filtern (SVG-Logos etc. tauchen sonst auf)
    SKIP_EXT = (".svg", ".webp", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf")
    links = [l for l in links if not l["url"].lower().endswith(SKIP_EXT)]

    by_url = {l["url"]: l["text"] for l in links}
    urls = list(by_url.keys())
    print(f"  · crawl {len(urls)} Sub-Pages parallel (nach Filter) …")
    results = await crawler.arun_many(urls=urls, config=run_cfg)

    written = 0
    for res in results:
        # res.url ist die tatsächlich gecrawlte URL — robust auch bei Order-Mix
        url = getattr(res, "url", None) or ""
        text = by_url.get(url) or urlparse(url).path.rsplit("/", 1)[-1]
        if not res.success:
            print(f"    ✗ {url}: {res.error_message}")
            continue
        slug_ag = slugify(text) or slugify(urlparse(url).path)
        (out_dir / f"{slug_ag}.md").write_text(
            f"<!-- url: {url} -->\n<!-- title: {text} -->\n\n{res.markdown or ''}",
            encoding="utf-8",
        )
        written += 1

    print(f"  ✓ {written}/{len(urls)} AG-Seiten gespeichert in {out_dir}")
    return {"slug": slug, "ok": True, "n_links": len(urls), "n_written": written}


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", help="Nur diese Klinik crawlen (slug aus sources.yaml)")
    ap.add_argument("--max", type=int, default=30, help="Max Sub-Pages pro Klinik")
    args = ap.parse_args()

    with open(SOURCES_FILE, encoding="utf-8") as f:
        sources = yaml.safe_load(f) or []
    if args.slug:
        sources = [s for s in sources if s["slug"] == args.slug]
        if not sources:
            print(f"Kein Eintrag mit slug={args.slug} in sources.yaml")
            return

    OUTPUT.mkdir(exist_ok=True)
    browser = BrowserConfig(headless=True, verbose=False)
    async with AsyncWebCrawler(config=browser) as crawler:
        report = []
        for s in sources:
            try:
                r = await crawl_clinic(crawler, s["slug"], s["index"], args.max)
                report.append(r)
            except Exception as e:
                print(f"  ✗ Ausnahme bei {s['slug']}: {e}")
                report.append({"slug": s["slug"], "ok": False, "error": str(e)})

    print("\n— Zusammenfassung —")
    for r in report:
        print(f"  {r}")


if __name__ == "__main__":
    asyncio.run(main())
