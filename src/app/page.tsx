import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  FileSearch,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { getStats, searchListings } from "@/lib/data";
import { flags } from "@/lib/flags";

export default async function Home() {
  const [stats, listings] = await Promise.all([getStats(), searchListings({})]);
  const recent = listings.slice(0, 4);

  return (
    <>
      <Hero stats={stats} />
      <HowItWorks />
      {recent.length > 0 && <RecentListings listings={recent} />}
      <Trust />
    </>
  );
}

/* -------------------------------------------------------------- HERO */
function Hero({ stats }: { stats: { listings: number; groups: number; universities: number } }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div aria-hidden className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
          <Sparkles className="h-3.5 w-3.5" />
          Für Medizinstudierende in Dresden
        </span>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-3xl text-stone-950">
          Finde deine Doktorarbeit.
          <br />
          <span className="text-indigo-700">Erfahre, was vorher niemand sagt.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
          PromotionsHub bündelt offene medizinische Doktorarbeit-Stellen der
          Dresdner Hochschulmedizin — und sammelt ehrliche Bewertungen der
          Gruppen und Betreuer:innen dahinter. Damit dein Bauchgefühl nicht
          das einzige ist, worauf du dich verlassen musst.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/finden"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow-md no-underline hover:no-underline"
          >
            <Compass className="h-4 w-4" />
            Welche Doktorarbeit passt zu mir?
          </Link>
          <Link
            href="/promotionen"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-900 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 hover:shadow no-underline hover:no-underline"
          >
            Alle Stellen durchsuchen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5">
          <Link
            href="/erfahrung-teilen"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white/70 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-white hover:shadow no-underline hover:no-underline"
          >
            <MessageSquareQuote className="h-3.5 w-3.5 text-indigo-700" />
            Schon promoviert? Erfahrung teilen
          </Link>
        </div>

        <dl className="mt-14 grid grid-cols-3 gap-x-6 gap-y-4 max-w-xl border-t border-stone-200 pt-8">
          <Stat value={stats.listings} label="Offene Stellen" />
          <Stat value={stats.groups} label="Forschungsgruppen" />
          <Stat value={stats.universities} label="Universitäten" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-display text-3xl font-semibold tabular-nums text-stone-950">{value}</dd>
      <dt className="mt-1 text-xs uppercase tracking-wider text-stone-500">{label}</dt>
    </div>
  );
}

/* -------------------------------------------------------------- HOW IT WORKS */
function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Suchen und filtern",
      body: "Offene Doktorarbeiten nach Stadt, Universität, Fachgebiet und Thesis-Typ — gebündelt aus den fragmentierten Fakultäts-Börsen.",
    },
    {
      icon: MessageSquareQuote,
      title: "Erfahrungen lesen",
      body: "Was sagen ehemalige und aktuelle Doktorand:innen über die Betreuung? Strukturierte, verifizierte Bewertungen — keine Hörensagen.",
    },
    {
      icon: ShieldCheck,
      title: "Mit Vertrauen entscheiden",
      body: "Bezahlung beeinflusst nie, wie eine Gruppe bewertet erscheint. Was du siehst, ist die Stimme der Studierenden.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
          Eine Suche. Eine ehrliche Antwort.
        </h2>
        <p className="mt-3 text-stone-600">
          Bisher musst du dutzende Fakultäts-Webseiten durchklicken und dich
          auf Gerüchte aus dem PJ verlassen. PromotionsHub macht beides
          besser.
        </p>
      </div>

      <ol className="mt-12 grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-xl border border-stone-200 bg-white p-6 card-hover"
          >
            <span className="absolute -top-3 left-6 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700 text-xs font-semibold text-white shadow ring-2 ring-white">
              {i + 1}
            </span>
            <s.icon className="h-6 w-6 text-indigo-700" strokeWidth={1.75} />
            <h3 className="mt-4 font-display text-lg font-semibold text-stone-950">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------- RECENT */
function RecentListings({ listings }: { listings: Awaited<ReturnType<typeof searchListings>> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-16">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
            Aktuelle Promotionsstellen
          </h2>
          <p className="mt-3 text-stone-600">Frisch eingespielt von Importer und Einreichungen.</p>
        </div>
        <Link
          href="/promotionen"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 no-underline underline-offset-4 hover:underline"
        >
          Alle anzeigen
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} compact />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- TRUST */
function Trust() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Unabhängig von Lehrstühlen",
      body:
        "Wir sind keine Universitätsplattform. Niemand kann ein Lehrstuhl-Image kaufen oder eine negative Bewertung verbergen lassen.",
    },
    {
      icon: CheckCircle2,
      title: "Verifizierte Identität",
      body:
        "Jede Bewertung kommt von einer Person mit verifizierter E-Mail-Adresse. Universitäts­adressen werden zusätzlich als Studierende erkannt.",
    },
    {
      icon: Building2,
      title: "Strukturierte Erfahrung",
      body:
        "Standardisierte Skalen statt langer Klagen: Betreuung, Erreichbarkeit, Realismus des Zeitplans, Datenlieferung, Weiterempfehlung.",
    },
    {
      icon: FileSearch,
      title: "Fairer Umgang mit Kritik",
      body:
        "Definiertes Notice-and-Takedown-Verfahren — keine Lösch-auf-Zuruf, aber auch keine Schmähkritik.",
    },
  ];

  return (
    <section className="relative bg-stone-100/70 border-y border-stone-200">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
            Warum du uns vertrauen kannst
          </h2>
          <p className="mt-3 text-stone-600">
            Die Plattform ist so gebaut, dass sie aushält, was sie verspricht.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-stone-200 bg-white p-5">
              <it.icon className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />
              <h3 className="mt-3 font-display text-base font-semibold text-stone-950">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{it.body}</p>
            </div>
          ))}
        </div>

        {!flags.NAMED_RATINGS_PUBLIC && (
          <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 max-w-3xl">
            <p className="font-semibold">Aktuelle Aufbauphase</p>
            <p className="mt-1.5">
              Wir starten mit der Stellensuche und sammeln zunächst nur
              aggregierte Erfahrungsberichte auf Gruppenebene. Namentliche
              Bewertungen einzelner Betreuer:innen werden erst öffentlich
              sichtbar, sobald genügend unabhängige verifizierte Berichte
              vorliegen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
