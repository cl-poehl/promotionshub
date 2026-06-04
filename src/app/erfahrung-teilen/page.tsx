import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, Clock, FileText, Info, Wallet } from "lucide-react";

import {
  FUNDING_AS_PROMISED,
  PROMOTION_STATUS,
  PUBLICATION_OUTCOME,
  REVIEW_DIMENSIONS,
  THESIS_TYPES,
  WEEKLY_HOURS,
} from "@/lib/config";
import { DATA_MODE, listGroups, searchListings } from "@/lib/data";
import { flags } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { submitReviewAction } from "./actions";
import { GroupListingPicker } from "./GroupListingPicker";

export const metadata = { title: "Erfahrung teilen" };

export default async function ErfahrungTeilenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.success) return <SuccessView />;

  const groups = await listGroups();
  const preselectedGroup = typeof params.gruppe === "string" ? params.gruppe : "";
  const preselectedListing = typeof params.listing === "string" ? params.listing : "";
  const error = typeof params.error === "string" ? params.error : null;

  // Wir laden alle Listings (für die Client-Komponente, die je nach Gruppe filtert)
  const allListings = await searchListings({});
  const listingMinis = allListings.map((l) => ({
    id: l.id,
    title: l.title,
    group_id: l.group_id,
    is_person_named: l.is_person_named,
  }));

  let isAuthed = false;
  let userEmail: string | null = null;
  if (DATA_MODE === "supabase") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthed = Boolean(user);
    userEmail = user?.email ?? null;
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  async function action(formData: FormData) {
    "use server";
    const result = await submitReviewAction(formData);
    if (result.ok) {
      redirect("/erfahrung-teilen?success=1");
    } else {
      redirect(`/erfahrung-teilen?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-950">
        Erfahrung teilen
      </h1>
      <p className="mt-2 text-stone-600">
        Hilf zukünftigen Doktorand:innen mit einem ehrlichen Bericht über deine
        Promotionszeit. Deine Identität bleibt für andere Studierende anonym.
      </p>

      <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-stone-500" />
          Wie wir damit umgehen
        </p>
        <ul className="mt-2 space-y-1.5 list-disc pl-5 text-stone-600">
          <li>
            <strong>Klinik-Bewertungen</strong> erscheinen ab 2 unabhängigen
            verifizierten Berichten.
          </li>
          <li>
            <strong>AG-Bewertungen</strong> erscheinen ab 2 Berichten; wenn die
            AG nach einer Einzelperson benannt ist (z.B. „Schröck Lab"),
            erst nach erweitertem Personen-Rating-Verfahren.
          </li>
          <li>
            Deine E-Mail wird zur Verifizierung genutzt, niemals neben deiner
            Bewertung angezeigt.
          </li>
          <li>
            Freitexte werden vor Veröffentlichung geprüft: keine
            Patient:innendaten, keine Namen Dritter, keine Beleidigungen.
          </li>
        </ul>
      </div>

      {!isAuthed && DATA_MODE === "supabase" && (
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm">
          Bitte zuerst <Link href="/anmelden">anmelden</Link>. Für jede Bewertung
          ist eine verifizierte E-Mail-Adresse erforderlich.
        </div>
      )}
      {DATA_MODE === "mock" && (
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Dev-Modus ohne Supabase: Du kannst das Formular sehen, aber nicht
          absenden.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <form action={action} className="mt-8 space-y-8">
        {/* Section 1: Kontext */}
        <Section title="Kontext" icon={FileText}>
          <GroupListingPicker
            groups={groups}
            listings={listingMinis}
            preselectedGroup={preselectedGroup}
            preselectedListing={preselectedListing}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Thesis-Typ" required>
              <select name="thesis_type" required defaultValue="" className="form-input">
                <option value="" disabled>
                  Wählen
                </option>
                {THESIS_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Begonnen" required>
              <select name="year_started" required defaultValue="" className="form-input">
                <option value="" disabled>
                  Jahr
                </option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Beendet">
              <select name="year_ended" defaultValue="" className="form-input">
                <option value="">offen</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Section 2: Promotion-Status */}
        <Section title="Wie ist deine Promotion ausgegangen?" icon={Award}>
          <RadioGroup
            label="Status"
            required
            name="promotion_status"
            options={PROMOTION_STATUS}
          />
          <RadioGroup
            label="Publikation"
            required
            name="publication_outcome"
            options={PUBLICATION_OUTCOME}
          />
        </Section>

        {/* Section 3: Zeit & Förderung */}
        <Section title="Zeit & Förderung" icon={Clock}>
          <RadioGroup
            label="Wöchentlicher Zeitaufwand"
            required
            name="weekly_hours"
            options={WEEKLY_HOURS}
            hint="Über die Hauptphase deiner Doktorarbeit gemittelt."
          />
          <RadioGroup
            label="Wurde die Förderung wie versprochen geleistet?"
            required
            name="funding_as_promised"
            options={FUNDING_AS_PROMISED}
            hint={`Wenn die Stelle als „bezahlt" oder „Stipendium" angekündigt war.`}
            icon={Wallet}
          />
        </Section>

        {/* Section 4: Likert-Bewertungen */}
        <Section title="Deine Bewertung" icon={null}>
          <p className="text-xs text-stone-500 -mt-2">1 = sehr schlecht, 5 = sehr gut</p>
          <div className="divide-y divide-stone-100">
            {REVIEW_DIMENSIONS.map((dim) => (
              <div key={dim.key} className="py-5 first:pt-0 last:pb-0">
                <LikertRow
                  name={dim.key}
                  label={dim.label}
                  prompt={dim.prompt}
                  low={dim.low}
                  high={dim.high}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5: Freitext */}
        {flags.REVIEW_FREE_TEXT_ENABLED && (
          <Section title="In eigenen Worten (optional)" icon={null}>
            <p className="text-xs text-stone-500">
              Schreibe nur was du selbst erlebt hast. Keine Namen Dritter, keine
              Patient:innendaten. Wir prüfen jeden Freitext, bevor er sichtbar
              wird.
            </p>
            <Field label="Was lief gut?">
              <textarea
                name="what_went_well"
                rows={4}
                maxLength={1500}
                placeholder="z.B. wöchentliche Lab-Meetings, gute Methodik-Einarbeitung, faire Autorenschaft …"
                className="form-input"
              />
            </Field>
            <Field label="Was war schwierig?">
              <textarea
                name="what_went_hard"
                rows={4}
                maxLength={1500}
                placeholder="z.B. Geräteengpässe, lange Antwortzeiten, unklare Erwartungen …"
                className="form-input"
              />
            </Field>
            <Field label="Tipp für Nachfolger:innen">
              <textarea
                name="tip_for_successors"
                rows={3}
                maxLength={1500}
                placeholder="Was hättest du selbst gerne vor dem Start gewusst?"
                className="form-input"
              />
            </Field>
          </Section>
        )}

        {/* Bestätigung + Submit */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <label
            htmlFor="truthful"
            className="flex items-start gap-2.5 text-sm text-stone-700 cursor-pointer"
          >
            <input type="checkbox" id="truthful" name="truthful" required className="mt-0.5 h-4 w-4" />
            <span>
              Ich bestätige, dass mein Bericht auf eigener, selbst erlebter
              Erfahrung beruht.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={DATA_MODE === "mock" || !isAuthed}
              className="inline-flex items-center rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Bericht absenden
            </button>
            {isAuthed && userEmail && (
              <p className="text-xs text-stone-500">
                Angemeldet als <code className="bg-stone-100 px-1 rounded">{userEmail}</code>
              </p>
            )}
          </div>
        </div>
      </form>

      <style>
        {`
          .form-input {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #d6d3d1;
            background: #fff;
            padding: 0.625rem 0.875rem;
            font-size: 0.875rem;
            line-height: 1.4;
            color: #1c1917;
            box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .form-input:hover:not(:disabled):not(:focus) {
            border-color: #a8a29e;
          }
          .form-input:focus {
            outline: none;
            border-color: #4338ca;
            box-shadow:
              0 0 0 3px rgba(99, 102, 241, 0.18),
              0 1px 2px rgba(28, 25, 23, 0.04);
          }
          .form-input::placeholder {
            color: #a8a29e;
          }
          select.form-input {
            appearance: none;
            -webkit-appearance: none;
            padding-right: 2.5rem;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            cursor: pointer;
          }
          textarea.form-input {
            resize: vertical;
            min-height: 5rem;
          }
          input[type="radio"],
          input[type="checkbox"] {
            accent-color: #4338ca;
          }
        `}
      </style>
    </div>
  );
}

/* ============================================================ Helper-Components */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }> | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="font-display text-base font-semibold text-stone-950 flex items-center gap-2.5">
        {Icon && (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
            <Icon className="h-4 w-4 text-indigo-700" />
          </span>
        )}
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-stone-500">{children}</p>;
}

function RadioGroup({
  label,
  required,
  name,
  options,
  hint,
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  name: string;
  options: readonly { key: string; label: string }[];
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Field label={label} required={required}>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.key}
            className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-white px-3.5 py-3 cursor-pointer shadow-sm transition hover:border-stone-300 hover:bg-stone-50/60 has-[input:checked]:border-indigo-600 has-[input:checked]:bg-indigo-50/60 has-[input:checked]:ring-1 has-[input:checked]:ring-indigo-600/30"
          >
            <input type="radio" name={name} value={o.key} required={required} className="mt-0.5" />
            <span className="text-sm text-stone-800 flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5 text-stone-400 hidden sm:block" />}
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {hint && <Hint>{hint}</Hint>}
    </Field>
  );
}

function LikertRow({
  name,
  label,
  prompt,
  low,
  high,
}: {
  name: string;
  label: string;
  prompt: string;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-stone-900">{label}</div>
      <div className="text-xs text-stone-500 mt-0.5">{prompt}</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="hidden sm:block text-[11px] text-stone-500 max-w-[100px] text-right">
          {low}
        </span>
        <div className="flex gap-2 flex-1 justify-center">
          {[1, 2, 3, 4, 5].map((v) => (
            <label key={v} className="text-sm">
              <input type="radio" name={name} value={v} required className="sr-only peer" />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white font-medium cursor-pointer shadow-sm transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105 peer-checked:bg-indigo-700 peer-checked:text-white peer-checked:border-indigo-700 peer-checked:shadow-md peer-checked:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2">
                {v}
              </span>
            </label>
          ))}
        </div>
        <span className="hidden sm:block text-[11px] text-stone-500 max-w-[100px]">{high}</span>
      </div>
      <div className="sm:hidden mt-1 flex justify-between text-[11px] text-stone-500">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">Danke für deinen Bericht!</h1>
      <p className="mt-3 text-stone-600">
        Wir haben deinen Erfahrungsbericht erhalten. Er fließt in die
        aggregierte Statistik ein, sobald genug unabhängige Berichte vorliegen.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:bg-stone-50 no-underline hover:no-underline"
        >
          Zur Startseite
        </Link>
        <Link
          href="/promotionen"
          className="rounded-md bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 no-underline hover:no-underline"
        >
          Weitere Stellen ansehen
        </Link>
      </div>
    </div>
  );
}
