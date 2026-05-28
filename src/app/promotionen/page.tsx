import Link from "next/link";

import { ListingCard } from "@/components/ListingCard";
import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";
import {
  listUniversities,
  searchListings,
  type ListingFilters,
} from "@/lib/data";
import type { FundingType, ThesisType } from "@/lib/supabase/types";

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
  const [listings, universities] = await Promise.all([
    searchListings(filters),
    listUniversities(),
  ]);
  const cities = Array.from(new Set(universities.map((u) => u.city))).sort((a, b) =>
    a.localeCompare(b, "de"),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Promotionsstellen</h1>
          <p className="mt-1 text-[var(--muted)]">
            {listings.length} offene {listings.length === 1 ? "Stelle" : "Stellen"} gefunden
          </p>
        </div>
        <Link
          href="/promotionen/neu"
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium no-underline hover:no-underline"
        >
          + Stelle einreichen
        </Link>
      </header>

      <form className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 rounded-lg border border-[var(--border)] bg-white p-4">
        <label className="text-sm">
          <span className="block mb-1 text-[var(--muted)]">Suche</span>
          <input
            type="search"
            name="q"
            defaultValue={filters.search ?? ""}
            placeholder="Stichwort, Methode …"
            className="w-full rounded border border-[var(--border)] px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-[var(--muted)]">Universität</span>
          <select
            name="uni"
            defaultValue={filters.universityId ?? ""}
            className="w-full rounded border border-[var(--border)] px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Alle</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-[var(--muted)]">Stadt</span>
          <select
            name="stadt"
            defaultValue={filters.city ?? ""}
            className="w-full rounded border border-[var(--border)] px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Alle</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-[var(--muted)]">Thesis-Typ</span>
          <select
            name="typ"
            defaultValue={filters.thesisType ?? ""}
            className="w-full rounded border border-[var(--border)] px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Alle</option>
            {THESIS_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-[var(--muted)]">Förderung</span>
          <select
            name="foerderung"
            defaultValue={filters.funding ?? ""}
            className="w-full rounded border border-[var(--border)] px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Alle</option>
            {FUNDING_TYPES.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2 lg:col-span-5 flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-sky-700 px-4 py-2 text-sm text-white"
          >
            Filter anwenden
          </button>
          <Link
            href="/promotionen"
            className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm no-underline hover:no-underline"
          >
            Zurücksetzen
          </Link>
        </div>
      </form>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
          Keine Stellen passen zu deinen Filtern. Versuche es mit anderen
          Kriterien oder{" "}
          <Link href="/promotionen">setze die Filter zurück</Link>.
        </div>
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
