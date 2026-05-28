import Link from "next/link";

import { DATA_MODE } from "@/lib/data";
import { flags } from "@/lib/flags";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <section className="py-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
          Finde deine Doktorarbeit — und erfahre,{" "}
          <span className="text-[var(--accent)]">wie die Betreuung wirklich ist.</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)] max-w-2xl">
          PromotionsHub bündelt offene medizinische Doktorarbeit-Stellen aus
          ganz Deutschland und sammelt ehrliche Bewertungen der Gruppen und
          Betreuer:innen dahinter.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/promotionen"
            className="inline-flex items-center rounded-md bg-sky-700 px-5 py-3 text-white font-medium no-underline hover:no-underline"
          >
            Promotionsstellen durchsuchen
          </Link>
          <Link
            href="/erfahrung-teilen"
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-white px-5 py-3 font-medium text-[var(--foreground)] no-underline hover:no-underline"
          >
            Eigene Erfahrung teilen
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Eine Suche, alle Fakultäten"
          body="Stellen aus den Doktorandenbörsen deutscher medizinischer Fakultäten an einem Ort, filterbar nach Stadt, Fachgebiet, Thesis-Typ und Förderung."
        />
        <FeatureCard
          title="Ehrliche Erfahrungen"
          body="Strukturierte Bewertungen aus erster Hand — von Betreuung über Realismus des Zeitplans bis zur Frage, ob das Projekt am Ende verwertbare Daten geliefert hat."
        />
        <FeatureCard
          title="Gebaut für Studierende"
          body="Nicht für Kliniken, nicht für Lehrstühle. Bezahlung kann eine Stelle in der Suche hervorheben, beeinflusst aber niemals, wie eine Gruppe bewertet erscheint."
        />
      </section>

      <PhaseNotice />
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}

function PhaseNotice() {
  if (DATA_MODE === "supabase" && flags.NAMED_RATINGS_PUBLIC) return null;
  return (
    <aside className="mt-12 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] p-5 text-sm text-[var(--warning-text)]">
      <p className="font-semibold">Hinweis zur aktuellen Aufbauphase</p>
      <p className="mt-2">
        Wir starten mit der Stellensuche und sammeln zunächst nur{" "}
        <strong>aggregierte</strong> Erfahrungsberichte auf Gruppenebene.
        Namentliche Bewertungen einzelner Betreuer:innen werden erst öffentlich
        sichtbar, sobald genügend unabhängige verifizierte Berichte vorliegen
        und die rechtlichen Grundlagen final geprüft sind.
      </p>
      {DATA_MODE === "mock" && (
        <p className="mt-3 text-xs">
          Dev-Modus: Supabase ist nicht konfiguriert — die Anwendung läuft mit
          Beispiel-Daten. Siehe README für Setup.
        </p>
      )}
    </aside>
  );
}
