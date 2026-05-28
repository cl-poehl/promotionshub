import { redirect } from "next/navigation";
import Link from "next/link";

import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";
import { DATA_MODE, listGroups, listUniversities } from "@/lib/data";
import { submitListingAction } from "./actions";

export const metadata = {
  title: "Promotionsstelle einreichen",
};

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
      <h1 className="text-3xl font-semibold tracking-tight">Promotionsstelle einreichen</h1>
      <p className="mt-2 text-[var(--muted)]">
        Du betreust selbst eine offene Doktorarbeit oder kennst eine? Reiche sie
        hier ein. Wir prüfen jede Einreichung manuell, bevor sie sichtbar wird.
      </p>

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

      <form action={action} className="mt-8 space-y-5">
        <Field label="Titel der Doktorarbeit" name="title" required maxLength={200} />

        <Field
          label="Beschreibung"
          name="description"
          required
          type="textarea"
          rows={6}
          hint="Methodik, Zeitaufwand, Vorkenntnisse, Förderung — was Studierende für die Entscheidung brauchen."
        />

        <Select label="Universität" name="university_id" required>
          <option value="">Bitte wählen</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-sm font-medium">Gruppe / Institut</label>
          <p className="text-xs text-[var(--muted)] mt-1">
            Bestehende Gruppe wählen oder eine neue eintragen.
          </p>
          <select
            name="group_id"
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
            defaultValue=""
          >
            <option value="">— Neue Gruppe (Namen unten eintragen) —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="new_group_name"
            placeholder="Name der neuen Gruppe (falls oben nicht gewählt)"
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
        </div>

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
        />

        <Field
          label="Bewerbungs-Kontakt (E-Mail)"
          name="application_contact"
          type="email"
          required
        />

        <div className="flex items-start gap-2 text-sm">
          <input type="checkbox" id="agree" name="agree" required className="mt-1" />
          <label htmlFor="agree" className="text-[var(--muted)]">
            Ich bestätige, dass diese Stelle existiert und der angegebene Kontakt
            zustimmt, Bewerbungen zu erhalten. Mir ist bewusst, dass irreführende
            Einreichungen entfernt werden.
          </label>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-[var(--accent-foreground)] font-medium"
        >
          Zur Prüfung einreichen
        </button>
      </form>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Vielen Dank!</h1>
      <p className="mt-3 text-[var(--muted)]">
        Deine Einreichung ist eingegangen und wird von uns geprüft. Sobald sie
        freigegeben ist, erscheint die Stelle in der Suche.
      </p>
      <Link
        href="/promotionen"
        className="mt-6 inline-block rounded-md border border-[var(--border)] bg-white px-4 py-2 no-underline hover:no-underline"
      >
        Zurück zur Suche
      </Link>
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
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  min?: number;
  max?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {hint && <p className="text-xs text-[var(--muted)] mt-1">{hint}</p>}
      {type === "textarea" ? (
        <textarea
          name={name}
          required={required}
          rows={rows}
          className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          {...rest}
        />
      )}
    </div>
  );
}

function Select({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <select
        name={name}
        required={required}
        className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
        defaultValue=""
      >
        {children}
      </select>
    </div>
  );
}
