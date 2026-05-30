import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  HeartPulse,
  Mail,
  MapPin,
  Microscope,
} from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { ListingFeedback } from "./ListingFeedback";
import { getGroupAggregate, getListing, getListingAggregate } from "@/lib/data";
import {
  FUNDING_TYPES,
  MIN_REVIEWS_FOR_GROUP_SCORE,
  MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE,
  THESIS_TYPES,
} from "@/lib/config";
import { flags } from "@/lib/flags";
import { AggregateRating } from "@/components/AggregateRating";

function labelOf<T extends { key: string; label: string }>(list: readonly T[], key: string) {
  return list.find((x) => x.key === key)?.label ?? key;
}

const THESIS_META = {
  experimental: {
    icon: Microscope,
    label: "Experimentell",
    bar: "bg-violet-500",
    chip: "bg-violet-50 text-violet-800 ring-violet-200",
  },
  clinical: {
    icon: HeartPulse,
    label: "Klinisch",
    bar: "bg-sky-500",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
  },
  statistical: {
    icon: BarChart3,
    label: "Statistisch",
    bar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  other: {
    icon: Bookmark,
    label: "Sonstige",
    bar: "bg-stone-400",
    chip: "bg-stone-100 text-stone-700 ring-stone-200",
  },
} as const;

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const [groupAggregate, listingAggregate] = await Promise.all([
    listing.group ? getGroupAggregate(listing.group.id) : Promise.resolve(null),
    getListingAggregate(listing.id),
  ]);
  const groupAboveThreshold =
    !!groupAggregate && groupAggregate.reviewCount >= MIN_REVIEWS_FOR_GROUP_SCORE;

  // Schwelle für Listing-Aggregat hängt von Person-Named-Status ab
  const listingThreshold = listing.is_person_named
    ? MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE
    : MIN_REVIEWS_FOR_GROUP_SCORE;
  // Person-Named-Listings sind hinter NAMED_RATINGS_PUBLIC versteckt
  const listingRatingAllowed = !listing.is_person_named || flags.NAMED_RATINGS_PUBLIC;
  const listingAboveThreshold =
    listingRatingAllowed && listingAggregate.reviewCount >= listingThreshold;

  const thesisMeta = THESIS_META[listing.thesis_type];
  const ThesisIcon = thesisMeta.icon;

  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-16">
      <Link
        href="/promotionen"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 no-underline hover:text-stone-900 hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Alle Promotionsstellen
      </Link>

      {/* Hero mit farbigem Typ-Streifen */}
      <header className="mt-6 relative">
        <span
          aria-hidden
          className={`absolute -left-3 top-1 bottom-1 w-1 rounded-full ${thesisMeta.bar}`}
        />
        <div className="pl-2">
          <div className="flex items-center gap-2 flex-wrap">
            {(listing.thesis_types_offered ?? [listing.thesis_type]).map((t) => {
              const meta = THESIS_META[t];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${meta.chip}`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {meta.label}
                </span>
              );
            })}
            {listing.promoted && (
              <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-900 ring-1 ring-amber-200">
                Hervorgehoben
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-stone-950">
            {listing.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-stone-400" />
              {listing.group ? (
                <Link
                  href={`/gruppen/${listing.group.id}`}
                  className="hover:underline underline-offset-4 no-underline"
                >
                  {listing.group.name}
                </Link>
              ) : "—"}
            </span>
            {listing.university?.name && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-stone-400" />
                {listing.university.name}
                {listing.university.city ? `, ${listing.university.city}` : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Quick-Facts-Streifen — nur Facts mit Aussagekraft */}
      <QuickFacts
        funding={listing.funding}
        duration={listing.expected_duration_months}
        postedAt={listing.posted_at}
        applicationContact={listing.application_contact}
      />

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {/* Hauptspalte */}
        <div className="md:col-span-2 space-y-8">
          <article className="prose-listing">
            <Markdown>{listing.description}</Markdown>
          </article>

          <ApplyBlock
            contact={listing.application_contact}
            sourceUrl={extractSourceUrlFromDescription(listing.description)}
            groupPublicUrl={listing.group?.public_url ?? null}
          />
        </div>

        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          {/* Aggregat speziell für diese AG (Listing) */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-500">
              Erfahrungen mit dieser AG
            </h3>
            {listing.is_person_named && (
              <p className="mt-1 text-xs text-amber-800">
                Diese AG ist nach einer Einzelperson benannt — Bewertungen
                erscheinen erst nach erweitertem Personen-Rating-Verfahren.
              </p>
            )}
            <div className="mt-4">
              {listingAboveThreshold ? (
                <AggregateRating aggregate={listingAggregate} />
              ) : (
                <p className="text-sm text-stone-600">
                  {listing.is_person_named && !flags.NAMED_RATINGS_PUBLIC ? (
                    <>Personen-Ratings derzeit nicht öffentlich.</>
                  ) : (
                    <>
                      Noch nicht genug verifizierte Erfahrungen
                      {" "}({listingAggregate.reviewCount}/{listingThreshold}).
                    </>
                  )}
                </p>
              )}
            </div>
            <Link
              href={
                listing.group
                  ? `/erfahrung-teilen?gruppe=${listing.group.id}&listing=${listing.id}`
                  : `/erfahrung-teilen?listing=${listing.id}`
              }
              className="mt-4 block w-full rounded-md bg-indigo-700 px-3 py-2 text-center text-sm font-medium text-white shadow-sm transition hover:bg-indigo-800 no-underline hover:no-underline"
            >
              Diese AG bewerten
            </Link>
          </div>

          {/* Aggregat für die ganze Klinik */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-500">
              Erfahrungen mit der Klinik
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Aggregat über <strong>alle AGs</strong> dieser Klinik. Bezahlung
              hat keinen Einfluss auf die Darstellung.
            </p>
            <div className="mt-4">
              {groupAboveThreshold && groupAggregate ? (
                <AggregateRating aggregate={groupAggregate} />
              ) : (
                <p className="text-sm text-stone-600">
                  Noch nicht genug verifizierte Erfahrungen
                  {" "}({groupAggregate?.reviewCount ?? 0}/{MIN_REVIEWS_FOR_GROUP_SCORE}).
                </p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {listing.group && (
                <Link
                  href={`/gruppen/${listing.group.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 no-underline hover:underline underline-offset-4"
                >
                  Gruppen-Profil ansehen
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
              <Link
                href={
                  listing.group
                    ? `/erfahrung-teilen?gruppe=${listing.group.id}`
                    : "/erfahrung-teilen"
                }
                className="block w-full rounded-md border border-indigo-700 px-3 py-2 text-center text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 no-underline hover:no-underline"
              >
                Klinik allgemein bewerten
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <ListingFeedback listingId={listing.id} />
    </div>
  );
}

/**
 * Bewerbungs-Block.
 *
 * Die Klinik-Seiten verstecken E-Mails meistens hinter cryptmail-Schutz —
 * crawl4ai sieht sie nicht. Drei Fälle:
 *   1. contact enthält eine E-Mail → mailto-Link, sekundäre Klinik-Seite
 *   2. contact ohne E-Mail (nur Name/Telefon) → Primär-Action: Klinik-Seite
 *      mit explizitem Hinweis „E-Mail dort sichtbar"
 *   3. gar kein Kontakt → nur die Klinik-Seite, fallback
 */
function ApplyBlock({
  contact,
  sourceUrl,
  groupPublicUrl,
}: {
  contact: string | null;
  sourceUrl: string | null;
  groupPublicUrl: string | null;
}) {
  const targetUrl = sourceUrl ?? groupPublicUrl;
  const email = contact?.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? null;
  const phone = contact?.match(/(?:Tel\.|\+49|0\d{2,4})[\s.\-\d]+/i)?.[0]?.trim() ?? null;
  const restOfContact = contact
    ? contact
        .replace(email ?? "", "")
        .replace(phone ?? "", "")
        .replace(/\s*[·,]\s*$/, "")
        .replace(/^\s*[·,]\s*/, "")
        .trim()
    : null;

  if (!contact && !targetUrl) return null;

  // Wenn wir KEINE E-Mail haben aber die Klinik-Seite, wird der Klinik-Link
  // die Primär-Action — mit Hinweis, dass dort die echte Adresse steht.
  const linkIsPrimary = !email && !!targetUrl;

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5">
      <h2 className="font-display text-base font-semibold text-stone-950 flex items-center gap-2">
        <Mail className="h-4 w-4 text-indigo-700" />
        Bewerbung
      </h2>

      {contact && (
        <div className="mt-3 space-y-1 text-sm text-stone-700">
          {email && (
            <p>
              <a
                href={`mailto:${email}`}
                className="font-medium underline underline-offset-4 text-indigo-700"
              >
                {email}
              </a>
            </p>
          )}
          {restOfContact && <p className="text-stone-700">{restOfContact}</p>}
          {phone && (
            <p className="text-stone-700">
              <span className="text-stone-500">{email ? "Tel.: " : ""}</span>
              {phone.replace(/^Tel\.\s*/i, "")}
            </p>
          )}
        </div>
      )}

      {targetUrl && (
        <div className="mt-4">
          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className={
              linkIsPrimary
                ? "inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow no-underline hover:no-underline"
                : "inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-white px-3.5 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 no-underline hover:no-underline"
            }
          >
            {linkIsPrimary ? "Zur Klinik-Seite — E-Mail dort sichtbar" : "Auf der Klinik-Seite öffnen"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {linkIsPrimary && (
            <p className="mt-2 text-xs text-stone-500">
              Die Klinik versteckt E-Mail-Adressen aus Anti-Spam-Gründen. Auf der
              verlinkten Seite ist die Adresse als anklickbarer Button sichtbar.
            </p>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-stone-500">
        PromotionsHub ist nicht Teil des Bewerbungsverfahrens. Wende dich
        direkt an die angegebene Stelle.
      </p>
    </section>
  );
}

/** Holt die im Markdown angehängte „Quelle: URL"-Zeile heraus. */
function extractSourceUrlFromDescription(description: string): string | null {
  const m = description.match(/Quelle:\s*(https?:\/\/\S+)/);
  return m ? m[1] : null;
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-stone-950">{value}</div>
    </div>
  );
}

function QuickFacts({
  funding,
  duration,
  postedAt,
  applicationContact,
}: {
  funding: string;
  duration: number | null;
  postedAt: string;
  applicationContact: string | null;
}) {
  const facts: { label: string; value: string }[] = [];

  if (duration) facts.push({ label: "Erwartete Dauer", value: `${duration} Monate` });

  if (funding && funding !== "unknown") {
    facts.push({ label: "Förderung", value: labelOf(FUNDING_TYPES, funding) });
  }

  // "Eingestellt" nur zeigen, wenn älter als ~7 Tage — sonst keine Info ("heute")
  const ageDays = Math.floor((Date.now() - new Date(postedAt).getTime()) / 86_400_000);
  if (ageDays >= 7) {
    facts.push({ label: "Eingestellt", value: new Date(postedAt).toLocaleDateString("de-DE") });
  }

  if (applicationContact) {
    facts.push({
      label: "Bewerbung",
      value: applicationContact.includes("@") ? "per E-Mail" : "direkt",
    });
  }

  if (facts.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
      {facts.map((f) => (
        <Fact key={f.label} label={f.label} value={f.value} />
      ))}
    </section>
  );
}
