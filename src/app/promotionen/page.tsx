import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";
import {
  getFilterOptions,
  searchListings,
  type ListingFilters,
} from "@/lib/data";
import type { FundingType, ThesisType, University } from "@/lib/supabase/types";

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

      <FilterBar filters={filters} options={options} hasFilters={hasFilters} />

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

function FilterBar({
  filters,
  options,
  hasFilters,
}: {
  filters: ListingFilters;
  options: {
    universities: University[];
    cities: string[];
    specialties: string[];
    fundings: FundingType[];
  };
  hasFilters: boolean;
}) {
  // Filter werden nur angezeigt, wenn sie auch was zu filtern haben (≥ 2 Optionen
  // oder bereits aktiv). So verschwindet z.B. die Stadt-Liste, solange nur eine
  // Stadt im Datenbestand vorkommt — sobald mehr Unis dazukommen, taucht sie auf.
  const showUni = options.universities.length > 1 || !!filters.universityId;
  const showCity = options.cities.length > 1 || !!filters.city;
  const showSpecialty = options.specialties.length > 1 || !!filters.specialty;
  const showFunding =
    options.fundings.filter((f) => f !== "unknown").length > 0 || !!filters.funding;

  const fundingChoices = FUNDING_TYPES.filter(
    (f) => f.key === filters.funding || options.fundings.includes(f.key as FundingType),
  );

  return (
    <form className="mb-8 rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-stone-700">
        <SlidersHorizontal className="h-4 w-4 text-stone-500" />
        Filter
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SearchField defaultValue={filters.search ?? ""} />
        {showSpecialty && (
          <Select label="Fachbereich" name="fach" defaultValue={filters.specialty ?? ""}>
            <option value="">Alle</option>
            {options.specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
        <Select label="Thesis-Typ" name="typ" defaultValue={filters.thesisType ?? ""}>
          <option value="">Alle</option>
          {THESIS_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </Select>
        {showUni && (
          <Select label="Universität" name="uni" defaultValue={filters.universityId ?? ""}>
            <option value="">Alle</option>
            {options.universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}
        {showCity && (
          <Select label="Stadt" name="stadt" defaultValue={filters.city ?? ""}>
            <option value="">Alle</option>
            {options.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
        {showFunding && fundingChoices.length > 0 && (
          <Select label="Förderung" name="foerderung" defaultValue={filters.funding ?? ""}>
            <option value="">Alle</option>
            {fundingChoices.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800"
        >
          Anwenden
        </button>
        {hasFilters && (
          <Link
            href="/promotionen"
            className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 hover:bg-stone-50 no-underline hover:no-underline"
          >
            Zurücksetzen
          </Link>
        )}
      </div>
    </form>
  );
}

function SearchField({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-600 mb-1">Suche</span>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Stichwort, Methode …"
          className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-2 text-sm placeholder:text-stone-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
        />
      </div>
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-600 mb-1">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
      >
        {children}
      </select>
    </label>
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
