import Link from "next/link";
import { redirect } from "next/navigation";

import { TAKEDOWN_SUBSTANTIATION_WINDOW_DAYS } from "@/lib/config";
import { DATA_MODE } from "@/lib/data";
import { submitComplaintAction } from "./actions";

export const metadata = { title: "Inhalt melden" };

export default async function MeldungPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.success) return <SuccessView />;
  const error = typeof params.error === "string" ? params.error : null;
  const prefillReviewId = typeof params.bericht === "string" ? params.bericht : "";

  async function action(formData: FormData) {
    "use server";
    const result = await submitComplaintAction(formData);
    if (result.ok) {
      redirect("/meldung?success=1");
    } else {
      redirect(`/meldung?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Inhalt melden</h1>
      <p className="mt-2 text-[var(--muted)]">
        Du bist von einem Erfahrungsbericht betroffen und hältst eine Aussage
        für unzutreffend? Reiche hier eine Beschwerde ein.
      </p>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-stone-50 p-4 text-sm space-y-2">
        <p className="font-medium">So läuft das Verfahren:</p>
        <ol className="list-decimal pl-5 space-y-1 text-[var(--muted)]">
          <li>Wir nehmen deine Meldung auf und können den betroffenen Bericht zunächst verbergen.</li>
          <li>
            Wir leiten den konkreten Vorwurf an die Verfasser:in weiter und bitten
            innerhalb von {TAKEDOWN_SUBSTANTIATION_WINDOW_DAYS} Tagen um
            Substantiierung.
          </li>
          <li>
            Wird der Vorwurf nicht substantiiert oder handelt es sich um eine
            unzulässige Schmähung, wird der Inhalt entfernt. Anderenfalls
            bleibt er sichtbar.
          </li>
        </ol>
      </div>

      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}
      {DATA_MODE === "mock" && (
        <div className="mt-6 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3 text-sm text-[var(--warning-text)]">
          Dev-Modus ohne Supabase: Meldungen werden nicht persistiert.
        </div>
      )}

      <form action={action} className="mt-8 space-y-5">
        <label className="block text-sm">
          <span className="font-medium">ID des betroffenen Berichts *</span>
          <input
            name="target_review_id"
            type="text"
            required
            defaultValue={prefillReviewId}
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
            placeholder="UUID des Berichts"
          />
          <span className="block mt-1 text-xs text-[var(--muted)]">
            Die ID findest du am Ende der URL des betroffenen Eintrags.
          </span>
        </label>

        <div>
          <span className="text-sm font-medium">Art der Beanstandung *</span>
          <div className="mt-2 space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input type="radio" name="type" value="factual_dispute" required className="mt-1" />
              <span>
                <strong>Tatsachenbehauptung bestritten</strong> — eine konkrete Aussage
                ist objektiv falsch.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="radio" name="type" value="insult" className="mt-1" />
              <span>
                <strong>Schmähung / Beleidigung</strong> — der Bericht enthält keine
                sachliche Kritik, sondern persönliche Herabsetzung.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="radio" name="type" value="other" className="mt-1" />
              <span>
                <strong>Sonstiges</strong> — z.B. Datenschutz, Geheimhaltung,
                Patient:innen-Bezug.
              </span>
            </label>
          </div>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Konkreter Vorwurf *</span>
          <textarea
            name="claim_text"
            required
            rows={6}
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
            placeholder="Bitte zitiere die konkrete Aussage und beschreibe, warum sie unzutreffend oder unzulässig ist."
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Kontakt für Rückfragen (E-Mail oder Anschrift) *</span>
          <input
            name="complainant_contact"
            type="text"
            required
            className="mt-2 w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
          <span className="block mt-1 text-xs text-[var(--muted)]">
            Notwendig, damit wir das Verfahren mit dir abwickeln können.
          </span>
        </label>

        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-[var(--accent-foreground)] font-medium"
        >
          Meldung einreichen
        </button>
      </form>

      <p className="mt-8 text-xs text-[var(--muted)]">
        Bitte beachte: Allgemeine Anfragen erreichen uns über das{" "}
        <Link href="/impressum">Impressum</Link>.
      </p>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Meldung eingegangen</h1>
      <p className="mt-3 text-[var(--muted)]">
        Wir haben deine Meldung erhalten und prüfen sie. Du hörst innerhalb
        weniger Werktage von uns.
      </p>
    </div>
  );
}
