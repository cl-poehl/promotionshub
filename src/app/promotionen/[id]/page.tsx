import { notFound } from "next/navigation";
import Link from "next/link";

import { getGroupAggregate, getListing } from "@/lib/data";
import { FUNDING_TYPES, MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE, THESIS_TYPES } from "@/lib/config";
import { AggregateRating } from "@/components/AggregateRating";

function labelOf<T extends { key: string; label: string }>(list: readonly T[], key: string) {
  return list.find((x) => x.key === key)?.label ?? key;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const groupAggregate = listing.group ? await getGroupAggregate(listing.group.id) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/promotionen" className="text-sm">
        ← Zurück zur Stellenliste
      </Link>

      <header className="mt-4">
        {listing.promoted && (
          <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
            Hervorgehoben
          </span>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{listing.title}</h1>
        <p className="mt-2 text-[var(--muted)]">
          {listing.group?.name}
          {listing.university ? ` · ${listing.university.name}` : ""}
          {listing.university?.city ? ` · ${listing.university.city}` : ""}
        </p>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-semibold">Beschreibung</h2>
            <p className="mt-2 whitespace-pre-line text-[var(--foreground)]">
              {listing.description}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Eckdaten</h2>
            <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Thesis-Typ</dt>
                <dd>{labelOf(THESIS_TYPES, listing.thesis_type)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Förderung</dt>
                <dd>{labelOf(FUNDING_TYPES, listing.funding)}</dd>
              </div>
              {listing.expected_duration_months && (
                <div>
                  <dt className="text-[var(--muted)]">Erwartete Dauer</dt>
                  <dd>{listing.expected_duration_months} Monate</dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--muted)]">Eingestellt</dt>
                <dd>{new Date(listing.posted_at).toLocaleDateString("de-DE")}</dd>
              </div>
            </dl>
          </section>

          {listing.application_contact && (
            <section>
              <h2 className="text-lg font-semibold">Bewerbung</h2>
              <p className="mt-2 text-sm">
                Kontakt:{" "}
                <a href={`mailto:${listing.application_contact}`}>
                  {listing.application_contact}
                </a>
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Hinweis: PromotionsHub ist nicht Teil des Bewerbungsverfahrens.
                Wende dich direkt an die angegebene Kontaktadresse.
              </p>
            </section>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <h3 className="text-sm font-semibold">Erfahrungen mit dieser Gruppe</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Bewertungen werden{" "}
              <strong>unabhängig davon</strong> angezeigt, ob diese Stelle hervorgehoben ist.
            </p>
            <div className="mt-4">
              {groupAggregate && groupAggregate.reviewCount >= MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE ? (
                <AggregateRating aggregate={groupAggregate} />
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Noch nicht genug verifizierte Erfahrungsberichte
                  ({groupAggregate?.reviewCount ?? 0}/{MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE}).
                </p>
              )}
            </div>

            {listing.group && (
              <Link
                href={`/gruppen/${listing.group.id}`}
                className="mt-4 inline-block text-sm"
              >
                Gruppen-Profil ansehen →
              </Link>
            )}

            <Link
              href={
                listing.group
                  ? `/erfahrung-teilen?gruppe=${listing.group.id}`
                  : "/erfahrung-teilen"
              }
              className="mt-4 block rounded-md border border-[var(--accent)] px-3 py-2 text-center text-sm text-[var(--accent)] no-underline hover:no-underline"
            >
              Eigene Erfahrung teilen
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
