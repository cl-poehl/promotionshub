import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import { MIN_REVIEWS_FOR_GROUP_SCORE } from "@/lib/config";
import {
  getTopGroups,
  getTopListings,
  type LeaderboardGroup,
  type LeaderboardListing,
} from "@/lib/data";

export const metadata = {
  title: "Bestenliste",
  description:
    "Die bestbewerteten Arbeitsgruppen und Kliniken für medizinische Doktorarbeiten in Dresden, basierend auf verifizierten Erfahrungsberichten.",
};

export const revalidate = 300; // 5 Minuten Cache reicht für ein Ranking

export default async function BestenlistePage() {
  const [topGroups, topListings] = await Promise.all([
    getTopGroups(10),
    getTopListings(10),
  ]);
  const isEmpty = topGroups.length === 0 && topListings.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          <Trophy className="h-3.5 w-3.5" />
          Bestenliste
        </span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
          Die bestbewerteten AGs und Kliniken
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Gerankt nach dem Durchschnitt aller fünf Bewertungs-Dimensionen aus
          verifizierten Erfahrungsberichten. Ein Eintrag erscheint ab{" "}
          {MIN_REVIEWS_FOR_GROUP_SCORE} unabhängigen Berichten. Bezahlung hat
          keinen Einfluss auf dieses Ranking.
        </p>
      </header>

      {isEmpty ? <EmptyState /> : (
        <div className="space-y-12">
          {topListings.length > 0 && (
            <LeaderboardSection
              title="Top-Arbeitsgruppen"
              icon={Users}
              rows={topListings.map((l) => ({
                key: l.listingId,
                href: `/promotionen/${l.listingId}`,
                primary: l.title,
                secondary: l.groupName,
                overall: l.overall,
                reviewCount: l.reviewCount,
                verifiedStudentCount: l.verifiedStudentCount,
              }))}
            />
          )}
          {topGroups.length > 0 && (
            <LeaderboardSection
              title="Top-Kliniken und Institute"
              icon={Building2}
              rows={topGroups.map((g) => ({
                key: g.groupId,
                href: `/gruppen/${g.groupId}`,
                primary: g.name,
                secondary: g.specialty,
                overall: g.overall,
                reviewCount: g.reviewCount,
                verifiedStudentCount: g.verifiedStudentCount,
              }))}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Empty State */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 sm:p-12 text-center shadow-sm">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Trophy className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-stone-950">
        Die Bestenliste ist noch leer
      </h2>
      <p className="mx-auto mt-3 max-w-md text-stone-600">
        Hier erscheinen die bestbewerteten Arbeitsgruppen und Kliniken, sobald
        mindestens {MIN_REVIEWS_FOR_GROUP_SCORE} unabhängige Berichte pro
        Eintrag vorliegen. Das Ranking entsteht aus euren Erfahrungen. Mach den
        Anfang!
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/erfahrung-teilen"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow-md no-underline hover:no-underline"
        >
          <MessageSquareQuote className="h-4 w-4" />
          Eigene Erfahrung teilen
        </Link>
        <Link
          href="/promotionen"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-900 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 no-underline hover:no-underline"
        >
          Stellen durchsuchen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3 text-left">
        <EmptyFact
          icon={ShieldCheck}
          title="Verifiziert"
          body="Jeder Bericht kommt von einer Person mit bestätigter E-Mail-Adresse."
        />
        <EmptyFact
          icon={Users}
          title="Ab 2 Berichten"
          body="Einzelmeinungen ranken nicht. Erst unabhängige Berichte ergeben einen Score."
        />
        <EmptyFact
          icon={Trophy}
          title="Nicht kaufbar"
          body="Bezahlung beeinflusst weder Scores noch Reihenfolge."
        />
      </div>
    </div>
  );
}

function EmptyFact({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <Icon className="h-4 w-4 text-indigo-700" />
      <p className="mt-2 text-sm font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------ Leaderboard */

type Row = {
  key: string;
  href: string;
  primary: string;
  secondary: string | null;
  overall: number;
  reviewCount: number;
  verifiedStudentCount: number;
};

function LeaderboardSection({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: Row[];
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-stone-950 flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
          <Icon className="h-4 w-4 text-indigo-700" />
        </span>
        {title}
      </h2>
      <ol className="mt-5 space-y-3">
        {rows.map((row, i) => (
          <li key={row.key}>
            <Link
              href={row.href}
              className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 hover:shadow no-underline hover:no-underline"
            >
              <RankBadge rank={i + 1} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-950">{row.primary}</p>
                {row.secondary && (
                  <p className="truncate text-sm text-stone-500">{row.secondary}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="flex items-center justify-end gap-1.5 font-display text-lg font-semibold tabular-nums text-stone-950">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {row.overall.toFixed(1)}
                </p>
                <p className="text-xs text-stone-500">
                  {row.reviewCount}{" "}
                  {row.reviewCount === 1 ? "Bericht" : "Berichte"}
                  {row.verifiedStudentCount > 0 && (
                    <span
                      className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-700"
                      title={`${row.verifiedStudentCount} über Uni-Adresse verifiziert`}
                    >
                      <GraduationCap className="h-3 w-3" />
                      {row.verifiedStudentCount}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? "bg-amber-100 text-amber-800 ring-amber-200"
      : rank === 2
        ? "bg-stone-100 text-stone-700 ring-stone-200"
        : rank === 3
          ? "bg-orange-100 text-orange-800 ring-orange-200"
          : "bg-white text-stone-500 ring-stone-200";
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ring-1 ${styles}`}
    >
      {rank}
    </span>
  );
}
