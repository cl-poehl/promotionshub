import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink, MapPin } from "lucide-react";

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
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-16">
      <Link
        href="/promotionen"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 no-underline hover:text-stone-900 hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Alle Promotionsstellen
      </Link>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Forschungsgruppe
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-stone-950">
          {group.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600">
          {university?.name && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-stone-400" />
              {university.name}
            </span>
          )}
          {university?.city && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-stone-400" />
              {university.city}
            </span>
          )}
          {group.specialty && <span className="text-stone-500">· {group.specialty}</span>}
          {group.public_url && (
            <a
              href={group.public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-700 no-underline hover:underline underline-offset-4"
            >
              Klinik-Website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <section className="md:col-span-2 space-y-8">
          {groupListings.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-950">
                Offene Stellen ({groupListings.length})
              </h2>
              <div className="mt-4 grid gap-4">
                {groupListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="md:col-span-1">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-500">
              Erfahrungen (aggregiert)
            </h3>
            <div className="mt-4">
              {above ? (
                <AggregateRating aggregate={aggregate} />
              ) : (
                <div className="text-sm text-stone-600 space-y-3">
                  <p>
                    Noch nicht genug unabhängige verifizierte Berichte
                    ({aggregate.reviewCount}/{MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE}).
                  </p>
                  <p>
                    Hast du in dieser Gruppe gearbeitet?{" "}
                    <Link href={`/erfahrung-teilen?gruppe=${group.id}`}>
                      Teile deine Erfahrung
                    </Link>{" "}
                    und hilf, die Lücke zu schließen.
                  </p>
                </div>
              )}
            </div>
            <Link
              href={`/erfahrung-teilen?gruppe=${group.id}`}
              className="mt-5 block w-full rounded-md border border-indigo-700 px-3 py-2 text-center text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 no-underline hover:no-underline"
            >
              Eigene Erfahrung teilen
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
