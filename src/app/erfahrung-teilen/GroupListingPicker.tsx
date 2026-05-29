"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Group } from "@/lib/supabase/types";

type ListingMini = {
  id: string;
  title: string;
  group_id: string;
  is_person_named?: boolean;
};

/**
 * Verbundene Gruppe-/AG-Auswahl. Reagiert client-seitig: ändert man die
 * Gruppe, wird die AG-Auswahl auf die zugehörigen Listings gefiltert.
 *
 * Eingaben gehen direkt als <select name="group_id"> / "listing_id" in
 * das umschließende <form action>. Kein extra State-Tracking nötig.
 */
export function GroupListingPicker({
  groups,
  listings,
  preselectedGroup,
  preselectedListing,
}: {
  groups: Group[];
  listings: ListingMini[];
  preselectedGroup: string;
  preselectedListing: string;
}) {
  const [selectedGroup, setSelectedGroup] = useState(preselectedGroup);
  const [selectedListing, setSelectedListing] = useState(preselectedListing);

  const filteredListings = useMemo(
    () => listings.filter((l) => l.group_id === selectedGroup),
    [listings, selectedGroup],
  );

  // Wenn AG-Auswahl nicht (mehr) zur Gruppe passt, zurücksetzen.
  const currentListing = filteredListings.find((l) => l.id === selectedListing)
    ? selectedListing
    : "";

  const personNamedSelected = filteredListings.find(
    (l) => l.id === currentListing,
  )?.is_person_named;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-stone-800">
          Gruppe / Institut <span className="text-red-600">*</span>
        </label>
        <div className="mt-1.5">
          <select
            name="group_id"
            required
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedListing("");
            }}
            className="form-input"
          >
            <option value="">Bitte wählen</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-stone-500">
            Gruppe fehlt? Reiche sie über{" "}
            <Link href="/promotionen/neu">„Stelle einreichen"</Link> ein.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-800">
          Spezifische AG (optional)
        </label>
        <div className="mt-1.5">
          <select
            name="listing_id"
            value={currentListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            disabled={!selectedGroup}
            className="form-input disabled:bg-stone-100 disabled:text-stone-400"
          >
            <option value="">
              {selectedGroup
                ? `Allgemein (ganze Klinik, ${filteredListings.length} AGs verfügbar)`
                : "Erst Gruppe wählen"}
            </option>
            {filteredListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.is_person_named ? "👤 " : ""}{l.title}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-stone-500">
            Wenn deine Erfahrung sich auf eine konkrete AG bezieht, wähle sie
            hier. Sonst wird die Bewertung der Klinik allgemein zugeordnet.
            {" "}AGs mit 👤 sind nach einer Einzelperson benannt.
          </p>
        </div>
      </div>

      {personNamedSelected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Hinweis:</strong> Diese AG ist nach einer Einzelperson
          benannt. Deine Bewertung wird mit dem Personen-Rating-Schutz
          behandelt (höhere Schwelle, zusätzliches Verfahren vor öffentlicher
          Anzeige).
        </div>
      )}
    </>
  );
}
