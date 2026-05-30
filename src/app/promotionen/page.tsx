import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import {
  getFilterOptions,
  searchListings,
  type ListingFilters,
} from "@/lib/data";
import type { FundingType, ThesisType } from "@/lib/supabase/types";
import { FilterBar } from "./FilterBar";

export const metadata = {
  title: "Promotionsstellen suchen",
};

function parseFilters(searchParams: Record<string, string | string[] | undefined>): ListingFilters {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    universityId: get("uni") || undefined,
    city: get("stadt") || undefined,
    specialty: get("fach") || undefined,
    thesisType: (get("typ") as ThesisType) || undefined,
    funding: (get("foerderung") as FundingType) || undefined,
    search: get("q") || undefined,
  };
}

export default async function PromotionenIndex({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [listings, options] = await Promise.all([
    searchListings(filters),
    getFilterOptions(),
  ]);

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
            Promotionsstellen
          </h1>
          <p className="mt-2 text-stone-600">
            <span className="font-semibold text-stone-900">{listings.length}</span>{" "}
            {listings.length === 1 ? "offene Stelle" : "offene Stellen"}
            {hasFilters ? " mit den aktiven Filtern" : ""}
          </p>
        </div>
        <Link
          href="/promotionen/neu"
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 no-underline hover:no-underline"
        >
          <Plus className="h-4 w-4" />
          Stelle einreichen
        </Link>
      </header>

      <FilterBar options={options} />

      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
        <Search className="h-5 w-5 text-stone-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-stone-950">
        Keine Stellen für diese Filter
      </h3>
      <p className="mt-1 text-sm text-stone-600 max-w-md mx-auto">
        Versuche andere Kriterien, lockere die Filter, oder reiche selbst eine
        Stelle ein, die du kennst.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Link
          href="/promotionen"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:bg-stone-50 no-underline hover:no-underline"
        >
          Filter zurücksetzen
        </Link>
        <Link
          href="/promotionen/neu"
          className="rounded-md bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 no-underline hover:no-underline"
        >
          Stelle einreichen
        </Link>
      </div>
    </div>
  );
}
