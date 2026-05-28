import { notFound } from "next/navigation";
import Link from "next/link";

import { AggregateRating } from "@/components/AggregateRating";
import { MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE } from "@/lib/config";
import { getGroup, getGroupAggregate, getUniversity, searchListings } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  const [aggregate, university, allListings] = await Promise.all([
    getGroupAggregate(id),
    getUniversity(group.university_id),
    searchListings({}),
  ]);
  const groupListings = allListings.filter((l) => l.group_id === id);

  const above = aggregate.reviewCount >= MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/promotionen" className="text-sm">← Zurück zur Stellenliste</Link>

      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{group.name}</h1>
        <p className="mt-1 text-[var(--muted)]">
          {university?.name}
          {university?.city ? ` · ${university.city}` : ""}
          {group.specialty ? ` · ${group.specialty}` : ""}
        </p>
        {group.public_url && (
          <p className="mt-1 text-sm">
            <a href={group.public_url} target="_blank" rel="noreferrer">
              Offizielle Website ↗
            </a>
          </p>
        )}
      </header>

      <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold">Erfahrungsberichte (aggregiert)</h2>
        {above ? (
          <div className="mt-4">
            <AggregateRating aggregate={aggregate} />
          </div>
        ) : (
          <div className="mt-3 text-sm text-[var(--muted)]">
            <p>
              Noch nicht genug unabhängige verifizierte Berichte
              ({aggregate.reviewCount}/{MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE}),
              um eine aussagekräftige Aggregat-Bewertung zu zeigen.
            </p>
            <p className="mt-2">
              Hast du in dieser Gruppe gearbeitet?{" "}
              <Link href={`/erfahrung-teilen?gruppe=${group.id}`}>
                Teile deine Erfahrung
              </Link>{" "}
              und hilf, die Lücke zu schließen.
            </p>
          </div>
        )}
      </section>

      {groupListings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Offene Stellen in dieser Gruppe</h2>
          <div className="mt-4 grid gap-4">
            {groupListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
