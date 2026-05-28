import Link from "next/link";

import type { ListingWithRelations } from "@/lib/data";
import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";

function labelOf<T extends { key: string; label: string }>(list: readonly T[], key: string) {
  return list.find((x) => x.key === key)?.label ?? key;
}

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "heute";
  if (days < 2) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 31) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-white p-5 hover:border-[var(--accent)] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug">
            <Link href={`/promotionen/${listing.id}`} className="text-[var(--foreground)] no-underline hover:no-underline">
              {listing.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {listing.group?.name}
            {listing.university ? ` · ${listing.university.name}` : ""}
            {listing.university?.city ? ` · ${listing.university.city}` : ""}
          </p>
        </div>
        {listing.promoted && (
          <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
            Hervorgehoben
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-[var(--foreground)] line-clamp-3">
        {listing.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Pill>{labelOf(THESIS_TYPES, listing.thesis_type)}</Pill>
        <Pill>{labelOf(FUNDING_TYPES, listing.funding)}</Pill>
        {listing.expected_duration_months && (
          <Pill>{listing.expected_duration_months} Monate</Pill>
        )}
        <span className="ml-auto text-[var(--muted)]">{formatRelativeDate(listing.posted_at)}</span>
      </div>
    </article>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-stone-50 px-2 py-0.5 text-stone-700">
      {children}
    </span>
  );
}
