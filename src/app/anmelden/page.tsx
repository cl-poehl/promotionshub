import Link from "next/link";
import { redirect } from "next/navigation";

import { DATA_MODE } from "@/lib/data";
import { sendMagicLinkAction } from "./actions";

export const metadata = { title: "Anmelden" };

export default async function AnmeldenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = typeof params.error === "string" ? params.error : null;

  async function action(formData: FormData) {
    "use server";
    const result = await sendMagicLinkAction(formData);
    if (result.ok) {
      redirect(`/anmelden?sent=1`);
    } else {
      redirect(`/anmelden?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Anmelden</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Wir senden dir einen Anmelde-Link per E-Mail. Eine{" "}
        <strong>verifizierte E-Mail-Adresse</strong> ist erforderlich, um eine
        Erfahrung zu hinterlegen.
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Universitätsadressen (z.B. <code>@uni-…</code>, <code>@charite.de</code>)
        werden automatisch als „verifizierte/r Studierende/r“ erkannt. Persönliche
        Adressen funktionieren auch — sie sind der Weg für Alumni.
      </p>

      {sent && (
        <div className="mt-6 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          Wir haben dir einen Anmelde-Link gesendet. Bitte prüfe dein Postfach.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {DATA_MODE === "mock" && (
        <div className="mt-6 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3 text-sm text-[var(--warning-text)]">
          Dev-Modus ohne Supabase: Anmeldung ist deaktiviert.
        </div>
      )}

      <form action={action} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="font-medium">E-Mail-Adresse</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border border-[var(--border)] px-3 py-2"
            placeholder="vorname.name@uni-beispiel.de"
          />
        </label>

        <button
          type="submit"
          disabled={DATA_MODE === "mock"}
          className="w-full rounded-md bg-[var(--accent)] px-4 py-2 text-[var(--accent-foreground)] font-medium disabled:opacity-50"
        >
          Anmelde-Link senden
        </button>
      </form>

      <p className="mt-6 text-xs text-[var(--muted)]">
        Mit der Anmeldung akzeptierst du unsere{" "}
        <Link href="/agb">AGB</Link> und nimmst die{" "}
        <Link href="/datenschutz">Datenschutzhinweise</Link> zur Kenntnis.
      </p>
    </div>
  );
}
