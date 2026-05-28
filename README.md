# PromotionsHub

Deutschsprachige Plattform für Medizinstudierende: **offene Doktorarbeit-Stellen
finden** und **ehrliche Bewertungen der Betreuung lesen**.

Architektur und Prinzipien folgen der Build-Spezifikation im Repo-Brief.
Zwei Module, **strukturell getrennt**:

- **Listings** — Aggregator offener Promotionsstellen. Bezahlung darf hier das
  Suchranking beeinflussen.
- **Ratings** — Verzeichnis aggregierter Erfahrungen. Bezahlung darf hier
  **nichts** beeinflussen.

> ⚖️ Mit `⚖️` markierte Stellen müssen vor öffentlichem Phase-2-Launch durch
> eine:n IT-/Medienrechtsanwalt:in geprüft werden.

---

## Build-Phasen (siehe Spezifikation §1)

| Phase | Status im Code | Inhalt |
| --- | --- | --- |
| **1 — MVP** | ✅ implementiert | Listings-Suche, Einreichungsformular, Magic-Link-Auth, aggregierte Erfahrungs-Erfassung (keine öffentlichen namentlichen Scores), Notice-and-Takedown-Skeleton, Rechtsseiten-Platzhalter |
| **2 — namentliche Scores** | 🟡 Gerüst hinter `NAMED_RATINGS_PUBLIC` | `/betreuer/[id]` rendert nur bei aktivem Flag **und** erreichtem Schwellenwert |
| **3 — Monetarisierung** | ⚪ Tabellen vorhanden, deaktiviert | `monetization_surfaces`-Tabelle + Listing-`promoted`-Flag stehen bereit |

---

## Lokales Setup

### Variante A: ohne Supabase (sofort lauffähig)

```bash
npm install
npm run dev
```

Ohne `NEXT_PUBLIC_SUPABASE_URL` läuft die App im **Mock-Modus** mit
In-Memory-Beispiel-Daten. Auth, Einreichungen und Reviews sind in diesem Modus
deaktiviert (UI zeigt entsprechende Hinweise).

### Variante B: mit Supabase (vollständig funktionsfähig)

Das Repo nutzt die **Supabase GitHub-Integration** — Migrationen werden
beim Push automatisch angewendet.

1. **Supabase-Projekt anlegen** auf [supabase.com](https://supabase.com)
   (Region: Frankfurt für DSGVO + Latenz).
2. **GitHub-Integration** aktivieren: Project Settings → Integrations →
   GitHub Integration → Authorize. Repository auswählen,
   *Working directory* = `.`, *Automatic branching* + *Deploy to production*
   einschalten.
3. **Push auf `main`** → Supabase wendet `supabase/migrations/*.sql`
   automatisch auf die Produktions-DB an.
4. **Magic-Link aktivieren:** Authentication → Providers → Email
   (Confirm email an). URL Configuration:
   `http://localhost:3000` als Site URL,
   `http://localhost:3000/auth/callback` als Redirect URL.
5. **Env-Vars setzen** (Vorlage `.env.example` → `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` aus Project Settings → API.
6. `npm run dev`.

**Was wo läuft:**

| Datei | Wo angewendet | Inhalt |
| --- | --- | --- |
| `supabase/migrations/20260101000001_init.sql` | Produktion + Preview | Schema, Enums, Indizes, Views |
| `supabase/migrations/20260101000002_rls.sql` | Produktion + Preview | RLS-Policies + Aggregat-Funktionen |
| `supabase/migrations/20260101000003_seed_universities.sql` | Produktion + Preview | Echte Universitäten + Beispiel-Gruppen |
| `supabase/seed.sql` | **Nur Preview-Branches** | Fiktive Beispiel-Listings für PR-Previews |

Die Beispiel-Listings landen nie in Produktion. Echte Stellen kommen
über das Einreichungsformular oder den Importer.

---

## Wichtige Architektur-Invarianten (§2)

1. **Listings ≠ Ratings.** Getrennte Tabellen, getrennte Seiten, getrennte
   Ranking-Logik.
2. **Ratings sind bezahlungsblind.** Die `promoted`-Spalte existiert nur auf
   `listings`, nicht auf `supervisors` oder `reviews`. Die Listings-Suche
   sortiert nach `promoted` desc; die Ratings-Logik ignoriert es vollständig.
3. **Neutraler Host.** Moderation routet in einen Prozess, sie redaktioniert
   keine Inhalte um.
4. **Meinung vor Tatsache.** Likert-Dimensionen sind als persönliche Erfahrung
   formuliert. Freitext durchläuft (Phase 2) eine Anthropic-Triage und kommt
   bei `factual_claim`-Klassifikation nie automatisch online.
5. **Kein namentlicher Score ohne Korroboration.** Mindestens
   `MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE` (Default 4) unabhängige verifizierte
   Reviews, sonst „nicht genug Bewertungen“.
6. **Echtes Notice-and-Takedown.** Nicht „löschen auf Zuruf“. Siehe
   `src/app/meldung/` und `complaints`-Tabelle.
7. **Datenminimierung.** Verifizierungsdokumente werden **nicht gespeichert**
   (verify-then-discard). Bei Streit liefert die bewertende Person selbst
   nach.

---

## Feature-Flags

In `.env.local` oder Hosting-Env:

| Flag | Default | Wirkung |
| --- | --- | --- |
| `NAMED_RATINGS_PUBLIC` | `false` | Schaltet `/betreuer/[id]` frei. **NICHT** vor Anwaltsfreigabe und Haftungsvehikel umlegen. |
| `LISTING_PROMOTION_ENABLED` | `false` | Phase 3. UI für gebuchte Hervorhebungen. |
| `RECRUITING_ADS_ENABLED` | `false` | Phase 3. Residenz-Recruiting-Surface. |
| `STUDENT_PREMIUM_ENABLED` | `false` | Phase 3. |
| `REVIEW_FREE_TEXT_ENABLED` | `true` | Optionaler Freitext im Erfahrungsbericht. §12 offene Entscheidung. |
| `MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE` | `4` | §4 Schwellenwert. |

---

## Verzeichnisstruktur

```
src/
  app/
    page.tsx                         Landing
    promotionen/                     Listings-Modul
      page.tsx                       Suche + Filter
      [id]/page.tsx                  Detail (mit Gruppen-Aggregat in Sidebar)
      neu/                           Einreichungsformular + Server Action
    gruppen/[id]/                    Gruppen-Profil (Aggregat-Anzeige)
    betreuer/[id]/                   Phase-2-Gerüst (flag-gated)
    erfahrung-teilen/                Bewertungsformular + Server Action
    meldung/                         Notice-and-Takedown-Formular
    anmelden/                        Magic-Link-Login
    auth/callback/                   Magic-Link-Rücksprung
    impressum/  datenschutz/  agb/   Rechts-Platzhalter mit ⚖️-Hinweisen
  components/                        Wiederverwendbare UI
  lib/
    config.ts                        Schwellenwerte, Dimensionen, Listen
    flags.ts                         Feature-Flags
    data/                            Lese-Fassade (Supabase oder Mock)
    auth/university-email.ts         Uni-Mail-Erkennung
    supabase/{client,server,types}.ts
  middleware.ts                      Session-Refresh
supabase/migrations/                 SQL für Schema + RLS + Seed
```

---

## Nächste Schritte (vor Phase-2-Launch)

1. ⚖️ **Haftungsvehikel anlegen** (z.B. UG) und Impressum/AGB/Datenschutz
   finalisieren.
2. ⚖️ Einmalige **anwaltliche Prüfung** der Datenschutzhinweise, AGB und des
   Notice-and-Takedown-Verfahrens.
3. **Anthropic-Moderations-Pipeline** für Freitexte aktivieren
   (`ANTHROPIC_API_KEY` setzen, Triage-Endpoint in `src/lib/moderation/`
   ergänzen). Die Klassifikation darf **nie** Tatsachenbehauptungen
   automatisch publizieren.
4. **Seed-Universitäten erweitern** und erste Importer (semi-automatisch)
   für die fragmentierten Doktorandenbörsen einzelner Fakultäten schreiben.
5. **Admin-Queue** für Listing-Freigaben und Beschwerden ausbauen
   (aktuell nur DB-State; UI ist Aufgabe Phase 2).
6. `NAMED_RATINGS_PUBLIC` erst nach (1)–(5) und ausreichend Reviews umlegen.
