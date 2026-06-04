import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

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
        Adressen funktionieren auch: Sie sind der Weg für Alumni.
      </p>

      <ul className="mt-5 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Kein Passwort nötig:</strong> nichts zu merken, nichts zu
            vergessen.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Nur einmal pro Gerät:</strong> du bleibst angemeldet, bis
            du dich abmeldest.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Sicherer als ein Passwort:</strong> der Link gilt nur
            einmal und kann nicht geleakt oder erraten werden.
          </span>
        </li>
      </ul>

      {sent && (
        <div className="mt-6 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          Wir haben dir einen Anmelde-Link gesendet. Absender ist{" "}
          <strong>kontakt@promotionshub.de</strong>. Nichts angekommen? Wirf
          einen Blick in den Spam-Ordner.
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

        <label
          htmlFor="terms"
          className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer"
        >
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 accent-indigo-700"
          />
          <span>
            Ich akzeptiere die <Link href="/agb">Nutzungsbedingungen</Link> und
            habe die <Link href="/datenschutz">Datenschutzhinweise</Link> zur
            Kenntnis genommen.
          </span>
        </label>

        <button
          type="submit"
          disabled={DATA_MODE === "mock"}
          className="w-full rounded-md bg-indigo-700 hover:bg-indigo-800 px-4 py-2 text-white font-medium disabled:opacity-50"
        >
          Anmelde-Link senden
        </button>
      </form>
    </div>
  );
}
