"use client";

import { useState, useTransition } from "react";
import { Check, MessageCircleWarning } from "lucide-react";

import { submitListingFeedbackAction } from "./feedback-action";

const FEEDBACK_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "no_longer_exists", label: "Stelle existiert nicht mehr" },
  { value: "wrong_contact", label: "Bewerbungs-Kontakt veraltet / falsch" },
  { value: "wrong_research_focus", label: "Forschungsschwerpunkt falsch beschrieben" },
  { value: "wrong_thesis_type", label: "Thesis-Typ stimmt nicht" },
  { value: "outdated", label: "Beschreibung ist veraltet" },
  { value: "other", label: "Sonstiges" },
];

export function ListingFeedback({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitListingFeedbackAction(formData);
      if (result.ok) {
        setDone(true);
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="mt-12 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900 flex items-start gap-3">
        <Check className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Danke für deine Rückmeldung!</p>
          <p className="mt-1 text-emerald-800">
            Wir prüfen den Hinweis und aktualisieren den Eintrag, falls nötig.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-stone-200 pt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 underline-offset-4 hover:underline"
        >
          <MessageCircleWarning className="h-4 w-4" />
          Stimmt etwas nicht? Hinweis geben
        </button>
      ) : (
        <form action={handleSubmit} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <input type="hidden" name="listing_id" value={listingId} />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-stone-950 flex items-center gap-2">
                <MessageCircleWarning className="h-4 w-4 text-amber-700" />
                Eintrag melden
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Hilf uns, den Datenbestand aktuell zu halten. Kein Login nötig.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-stone-500 hover:text-stone-900"
            >
              Abbrechen
            </button>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-stone-800">Worum geht es?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {FEEDBACK_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex items-start gap-2 rounded-md border border-stone-200 bg-white p-2.5 text-sm cursor-pointer hover:border-stone-300 has-[input:checked]:border-indigo-600 has-[input:checked]:bg-indigo-50/50 transition"
                >
                  <input type="radio" name="type" value={o.value} required className="mt-1" />
                  <span className="text-stone-800">{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-stone-800">
              Was genau? <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              minLength={5}
              maxLength={2000}
              placeholder="Beschreibe kurz, was nicht passt oder fehlt …"
              className="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800">
              E-Mail für Rückfragen <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              name="reporter_email"
              placeholder="z.B. wenn wir nachfragen sollten"
              className="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Wird ausschließlich für Rückfragen zu dieser Meldung verwendet
              und nicht öffentlich angezeigt.
            </p>
          </div>

          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 disabled:opacity-50"
          >
            {pending ? "Wird gesendet …" : "Meldung absenden"}
          </button>
        </form>
      )}
    </div>
  );
}
