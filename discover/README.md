# Discover

Python-Mini-Pilot zur **automatisierten Erfassung** von Klinik-Forschungs-
Subpages. Lebt bewusst **außerhalb** der Next.js-Codebase — wird nur ad-hoc
oder per Cronjob zur Datenanreicherung genutzt.

## Setup

```bash
cd discover/dresden
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium   # ~150MB Download, einmalig
```

## Lauf

```bash
# nur MK1 (Pilot)
python discover.py --slug mk1

# alle in sources.yaml definierten Kliniken
python discover.py

# Limit pro Klinik
python discover.py --max 10
```

## Output

```
output/mk1/
  __index__.md          # die Klinik-Forschungs-Übersichtsseite als Markdown
  __links__.json        # alle entdeckten AG-Subpage-Links
  ag-mk1-l01.md         # je AG eine vollständige Markdown-Datei
  hampe-lab.md
  …
```

## Workflow

1. `discover.py` läuft → liefert Markdown pro AG.
2. Mensch (oder LLM mit Anthropic-Key) liest die Markdowns und bildet
   daraus eine ergänzende `ImporterSource`-Sektion für
   `../../scripts/importers/tu-dresden/sources.ts`.
3. `npm run import:tu-dresden` synchronisiert in die Supabase-DB
   (idempotent, entfernt veraltete `scraped`-Einträge).

## Warum nicht in der Hauptcodebase?

- Python + Playwright sind heavy Dependencies (~500MB Chromium-Bundle).
- Wird nicht zur Build- oder Laufzeit der Next.js-App gebraucht.
- Soll später durch einen scheduled Job ersetzt werden, der außerhalb
  des Webservers läuft.
