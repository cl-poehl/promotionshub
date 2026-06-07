import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";
import { DATA_MODE, listGroups, listUniversities } from "@/lib/data";
import { submitListingAction } from "./actions";

export const metadata = {
  title: "Promotionsstelle einreichen",
};

const DESCRIPTION_PLACEHOLDER = `## Worum geht es?
Kurz das Forschungsthema und die Fragestellung.

## Methoden
z.B. Zellkultur, Registerauswertung, Bildgebung, Statistik mit R …

## Was wir bieten
Betreuungskonzept, Lab-Meetings, Publikationsmöglichkeit, ggf. Vergütung.

## Was wir erwarten
Zeitaufwand (Vollzeit-Phase? neben dem Studium?), Vorkenntnisse.`;

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.success) {
    return <SuccessView />;
  }

  const [universities, groups] = await Promise.all([listUniversities(), listGroups()]);
  // Pilot-Phase: Dresden vorauswählen, andere Fakultäten sind trotzdem wählbar.
  const dresdenId =
    universities.find((u) => u.city === "Dresden")?.id ?? "";

  async function action(formData: FormData) {
    "use server";
    const result = await submitListingAction(formData);
    if (result.ok) {
      redirect("/promotionen/neu?success=1");
    } else {
      redirect(`/promotionen/neu?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
        <Sparkles className="h-3.5 w-3.5" />
        Kostenlos für Kliniken und AGs
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-stone-950">
        Promotionsstelle einreichen
      </h1>
      <p className="mt-2 text-stone-600">
        Du betreust selbst eine offene Doktorarbeit oder kennst eine? Erreiche
        hier Medizinstudierende in Dresden, die aktiv suchen.
      </p>

      <ul className="mt-5 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Manuelle Prüfung:</strong> Wir prüfen jede Einreichung,
            bevor sie sichtbar wird. Das hält die Qualität hoch.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Gefunden werden:</strong> Deine Stelle erscheint in der
            Suche, in den Filtern und im „Welche Doktorarbeit passt zu
            mir?&ldquo;-Quiz.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Faire Spielregeln:</strong> Einreichen ist kostenlos und
            hat keinerlei Einfluss darauf, wie deine Gruppe bewertet wird.
          </span>
        </li>
      </ul>

      {params.error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {params.error}
        </div>
      )}

      {DATA_MODE === "mock" && (
        <div className="mt-6 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3 text-sm text-[var(--warning-text)]">
          Dev-Modus ohne Supabase: Einreichungen werden nicht persistiert.
        </div>
      )}

      <form action={action} className="mt-8 space-y-8">
        {/* Section 1: Die Stelle */}
        <Section title="Die Stelle" icon={FileText}>
          <Field
            label="Titel der Doktorarbeit"
            name="title"
            required
            maxLength={200}
            placeholder='z.B. „Klinische Promotion zur Kollateralversorgung beim Schlaganfall"'
          />

          <Field
            label="Beschreibung"
            name="description"
            required
            type="textarea"
            rows={12}
            hint="Markdown wird unterstützt (## Überschriften, **fett**, Listen). Je konkreter, desto mehr passende Bewerbungen."
            placeholder={DESCRIPTION_PLACEHOLDER}
          />
        </Section>

        {/* Section 2: Zuordnung */}
        <Section title="Klinik / Institut" icon={Building2}>
          <Select label="Universität" name="university_id" required defaultValue={dresdenId}>
            <option value="">Bitte wählen</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.city})
              </option>
            ))}
          </Select>

          <Field2 label="Gruppe / Institut" required>
            <select name="group_id" className="form-input" defaultValue="">
              <option value="">Neue Gruppe anlegen (Name unten)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="new_group_name"
              placeholder="Nur ausfüllen, wenn deine Gruppe oben fehlt"
              className="form-input mt-2"
            />
            <Hint>
              Wähle die bestehende Klinik/das Institut. Nur wenn es noch nicht
              in der Liste steht, den Namen ins Textfeld eintragen.
            </Hint>
          </Field2>
        </Section>

        {/* Section 3: Rahmendaten */}
        <Section title="Rahmendaten" icon={Clock}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Thesis-Typ" name="thesis_type" required>
              {THESIS_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select label="Förderung" name="funding" required>
              {FUNDING_TYPES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>

          <Field
            label="Erwartete Dauer (Monate)"
            name="expected_duration_months"
            type="number"
            min={1}
            max={60}
            placeholder="z.B. 12"
            hint="Optional. Grobe Schätzung über die gesamte Laufzeit."
          />
        </Section>

        {/* Section 4: Kontakt */}
        <Section title="Bewerbungs-Kontakt" icon={Mail}>
          <Field
            label="E-Mail für Bewerbungen"
            name="application_contact"
            type="email"
            required
            placeholder="ag-name@uniklinikum-dresden.de"
            hint="An diese Adresse wenden sich Interessierte. Sie wird auf der Stellen-Seite angezeigt."
          />
        </Section>

        {/* Bestätigung + Submit */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <label
            htmlFor="agree"
            className="flex items-start gap-2.5 text-sm text-stone-700 cursor-pointer"
          >
            <input type="checkbox" id="agree" name="agree" required className="mt-0.5 h-4 w-4" />
            <span>
              Ich bestätige, dass diese Stelle existiert und der angegebene
              Kontakt zustimmt, Bewerbungen zu erhalten. Mir ist bewusst, dass
              irreführende Einreichungen entfernt werden.
            </span>
          </label>

          <button
            type="submit"
            disabled={DATA_MODE === "mock"}
            className="inline-flex items-center rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Zur Prüfung einreichen
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">Vielen Dank!</h1>
      <p className="mt-3 text-stone-600">
        Deine Einreichung ist eingegangen und wird von uns geprüft. Sobald sie
        freigegeben ist, erscheint die Stelle in der Suche und im Quiz.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/promotionen"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:bg-stone-50 no-underline hover:no-underline"
        >
          Zur Stellen-Suche
        </Link>
        <Link
          href="/promotionen/neu"
          className="rounded-md bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 no-underline hover:no-underline"
        >
          Weitere Stelle einreichen
        </Link>
      </div>
    </div>
  );
}

/* ============================================================ Helper */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="font-display text-base font-semibold text-stone-950 flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
          <Icon className="h-4 w-4 text-indigo-700" />
        </span>
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-stone-500">{children}</p>;
}

function Field2({
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

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
  rows,
  placeholder,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1.5">
        {type === "textarea" ? (
          <textarea
            name={name}
            required={required}
            rows={rows}
            placeholder={placeholder}
            className="form-input"
          />
        ) : (
          <input
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            className="form-input"
            {...rest}
          />
        )}
      </div>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}

function Select({
  label,
  name,
  required,
  defaultValue = "",
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1.5">
        <select name={name} required={required} className="form-input" defaultValue={defaultValue}>
          {children}
        </select>
      </div>
    </div>
  );
}
