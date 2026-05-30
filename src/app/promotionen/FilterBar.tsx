"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";
import type { FundingType, University } from "@/lib/supabase/types";

type FilterOptions = {
  universities: University[];
  cities: string[];
  specialties: string[];
  fundings: FundingType[];
};

type FilterState = {
  q: string;
  uni: string;
  stadt: string;
  fach: string;
  typ: string;
  foerderung: string;
};

const FILTER_KEYS = ["q", "uni", "stadt", "fach", "typ", "foerderung"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const SEARCH_DEBOUNCE_MS = 400;

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const sp = useSearchParams();

  // Aktueller URL-State, jeder Filter-Wert direkt aus den search params
  const initial: FilterState = {
    q: sp.get("q") ?? "",
    uni: sp.get("uni") ?? "",
    stadt: sp.get("stadt") ?? "",
    fach: sp.get("fach") ?? "",
    typ: sp.get("typ") ?? "",
    foerderung: sp.get("foerderung") ?? "",
  };

  const [state, setState] = useState<FilterState>(initial);
  const [pending, startTransition] = useTransition();

  // URL-Sync (auch wenn extern navigiert wird, z.B. via Zurücksetzen-Link)
  useEffect(() => {
    setState({
      q: sp.get("q") ?? "",
      uni: sp.get("uni") ?? "",
      stadt: sp.get("stadt") ?? "",
      fach: sp.get("fach") ?? "",
      typ: sp.get("typ") ?? "",
      foerderung: sp.get("foerderung") ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const pushToUrl = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams();
      for (const k of FILTER_KEYS) {
        if (next[k]) params.set(k, next[k]);
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/promotionen?${qs}` : `/promotionen`, { scroll: false });
      });
    },
    [router],
  );

  // Sofortige Anwendung für Select-Felder
  const setAndApply = useCallback(
    (key: FilterKey, value: string) => {
      setState((prev) => {
        const next = { ...prev, [key]: value };
        pushToUrl(next);
        return next;
      });
    },
    [pushToUrl],
  );

  // Debounced Anwendung für Suche
  const debounceRef = useRef<number | null>(null);
  const setSearch = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, q: value }));
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setState((prev) => {
          pushToUrl(prev);
          return prev;
        });
      }, SEARCH_DEBOUNCE_MS);
    },
    [pushToUrl],
  );

  // Hilfe: welche Filter sind aktiv
  const hasFilters = FILTER_KEYS.some((k) => state[k]);

  // Dynamische Sichtbarkeit
  const showUni = options.universities.length > 1 || !!state.uni;
  const showCity = options.cities.length > 1 || !!state.stadt;
  const showSpecialty = options.specialties.length > 1 || !!state.fach;
  const showFunding =
    options.fundings.filter((f) => f !== "unknown").length > 0 || !!state.foerderung;

  const fundingChoices = FUNDING_TYPES.filter(
    (f) => f.key === state.foerderung || options.fundings.includes(f.key as FundingType),
  );

  return (
    <div className="mb-8 rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-stone-700">
          <SlidersHorizontal className="h-4 w-4 text-stone-500" />
          Filter
        </span>
        {pending && (
          <span className="text-xs text-stone-500 animate-pulse">aktualisiert…</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Suche */}
        <label className="block">
          <span className="block text-xs font-medium text-stone-600 mb-1">Suche</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={state.q}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Stichwort, Methode …"
              className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-2 text-sm placeholder:text-stone-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>
        </label>

        {showSpecialty && (
          <SelectField
            label="Fachbereich"
            value={state.fach}
            onChange={(v) => setAndApply("fach", v)}
            options={[{ value: "", label: "Alle" }, ...options.specialties.map((s) => ({ value: s, label: s }))]}
          />
        )}
        <SelectField
          label="Thesis-Typ"
          value={state.typ}
          onChange={(v) => setAndApply("typ", v)}
          options={[
            { value: "", label: "Alle" },
            ...THESIS_TYPES.map((t) => ({ value: t.key, label: t.label })),
          ]}
        />
        {showUni && (
          <SelectField
            label="Universität"
            value={state.uni}
            onChange={(v) => setAndApply("uni", v)}
            options={[
              { value: "", label: "Alle" },
              ...options.universities.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        )}
        {showCity && (
          <SelectField
            label="Stadt"
            value={state.stadt}
            onChange={(v) => setAndApply("stadt", v)}
            options={[{ value: "", label: "Alle" }, ...options.cities.map((c) => ({ value: c, label: c }))]}
          />
        )}
        {showFunding && fundingChoices.length > 0 && (
          <SelectField
            label="Förderung"
            value={state.foerderung}
            onChange={(v) => setAndApply("foerderung", v)}
            options={[
              { value: "", label: "Alle" },
              ...fundingChoices.map((f) => ({ value: f.key, label: f.label })),
            ]}
          />
        )}
      </div>

      {hasFilters && (
        <div className="mt-4">
          <Link
            href="/promotionen"
            className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 hover:bg-stone-50 no-underline hover:no-underline"
          >
            Alle Filter zurücksetzen
          </Link>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-600 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
