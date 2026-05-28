import Link from "next/link";
import { redirect } from "next/navigation";

import { REVIEW_DIMENSIONS, THESIS_TYPES } from "@/lib/config";
import { DATA_MODE, listGroups } from "@/lib/data";
import { flags } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { submitReviewAction } from "./actions";

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
  const error = typeof params.error === "string" ? params.error : null;

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
      <h1 className="text-3xl font-semibold tracking-tight">Erfahrung teilen</h1>
      <p className="mt-2 text-[var(--muted)]">
        Hilf zukünftigen Doktorand:innen mit einem ehrlichen Bericht über deine
        Promotionszeit. Deine Identität bleibt für andere Studierende anonym.
      </p>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-stone-50 p-4 text-sm">
        <p className="font-medium">So gehen wir mit deinem Bericht um:</p>
        <ul className="mt-2 space-y-1 list-disc pl-5 text-[var(--muted)]">
          <li>
            In dieser Aufbauphase werden Bewertungen <strong>nur aggregiert</strong>{" "}
            auf Gruppen-Ebene angezeigt — nie einzeln, nie namentlich.
          </li>
          <li>
            Wir sammeln die Berichte, damit die Plattform für die Community
            nützlich wird, sobald genug unabhängige Erfahrungen vorliegen.
          </li>
          <li>
            Deine E-Mail wird zur Verifizierung genutzt, aber nie gemeinsam mit
            der Bewertung angezeigt.
          </li>
        </ul>
      </div>

      {!isAuthed && DATA_MODE === "supabase" && (
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm">
          Bitte zuerst <Link href="/anmelden">anmelden</Link>. Für jede
          Bewertung ist eine verifizierte E-Mail-Adresse erforderlich.
        </div>
      )}
      {DATA_MODE === "mock" && (
        <div className="mt-6 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3 text-sm text-[var(--warning-text)]">
          Dev-Modus ohne Supabase: Du kannst das Formular sehen, aber nicht
          absenden.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <form action={action} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium">Gruppe / Institut *</label>
          <select
            name="group_id"
            required
            defaultValue={preselectedGroup}
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
          >
            <option value="">Bitte wählen</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Gruppe fehlt? Reiche sie über{" "}
            <Link href="/promotionen/neu">„Stelle einreichen“</Link> ein, dann
            wird sie wählbar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Thesis-Typ *</label>
            <select
              name="thesis_type"
              required
              defaultValue=""
              className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>Wählen</option>
              {THESIS_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Begonnen *</label>
            <select
              name="year_started"
              required
              defaultValue=""
              className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>Jahr</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Beendet</label>
            <select
              name="year_ended"
              defaultValue=""
              className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm bg-white"
            >
              <option value="">noch laufend / abgebrochen</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <legend className="px-1 text-sm font-medium">Deine Erfahrung (1 = sehr schlecht, 5 = sehr gut)</legend>
          {REVIEW_DIMENSIONS.map((dim) => (
            <LikertRow key={dim.key} name={dim.key} label={dim.label} prompt={dim.prompt} />
          ))}
        </fieldset>

        {flags.REVIEW_FREE_TEXT_ENABLED && (
          <div>
            <label className="block text-sm font-medium">Freitext (optional)</label>
            <p className="text-xs text-[var(--muted)] mt-1">
              Beschreibe deine Erfahrung in der Gruppe — bitte nur was du selbst
              erlebt hast. Keine Namen Dritter, keine Patient:innendaten. Wir
              prüfen jeden Freitext, bevor er sichtbar wird.
            </p>
            <textarea
              name="free_text"
              rows={6}
              maxLength={3000}
              className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <input type="checkbox" id="truthful" name="truthful" required className="mt-1" />
          <label htmlFor="truthful" className="text-[var(--muted)]">
            Ich bestätige, dass mein Bericht auf eigener, selbst erlebter
            Erfahrung beruht.
          </label>
        </div>

        <button
          type="submit"
          disabled={DATA_MODE === "mock" || !isAuthed}
          className="rounded-md bg-indigo-700 hover:bg-indigo-800 px-5 py-2.5 text-white font-medium disabled:opacity-50"
        >
          Bericht absenden
        </button>

        {isAuthed && userEmail && (
          <p className="text-xs text-[var(--muted)]">
            Angemeldet als <code>{userEmail}</code>.
          </p>
        )}
      </form>
    </div>
  );
}

function LikertRow({ name, label, prompt }: { name: string; label: string; prompt: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] sm:items-center gap-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-[var(--muted)]">{prompt}</div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <label key={v} className="text-sm">
            <input type="radio" name={name} value={v} required className="sr-only peer" />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--border)] bg-white cursor-pointer peer-checked:bg-indigo-700 peer-checked:text-white peer-checked:border-[var(--accent)]">
              {v}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Danke für deinen Bericht!</h1>
      <p className="mt-3 text-[var(--muted)]">
        Wir haben deinen Erfahrungsbericht erhalten. Er fließt in die
        aggregierte Gruppen-Statistik ein, sobald genug unabhängige Berichte
        vorliegen.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-[var(--border)] bg-white px-4 py-2 no-underline hover:no-underline"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
