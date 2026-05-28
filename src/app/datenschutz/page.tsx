export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Datenschutzhinweise</h1>

      <div className="mt-4 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[var(--warning-text)]">
        ⚖️ <strong>Entwurf.</strong> Vor öffentlichem Launch muss diese Erklärung
        durch eine:n Anwält:in geprüft werden. Die hier umrissenen
        Verarbeitungen entsprechen dem aktuellen Plattform-Design (§9 Spec).
      </div>

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">1. Verantwortlich</h2>
          <p className="mt-1">Siehe <a href="/impressum">Impressum</a>.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Welche Daten wir verarbeiten</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Konto:</strong> E-Mail-Adresse (Pflicht), Session-Cookies,
              Login-Zeitpunkte. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
              (Vertrag) bzw. lit. f (berechtigtes Interesse an
              Account-Sicherheit).
            </li>
            <li>
              <strong>Erfahrungsberichte:</strong> die von dir eingegebenen
              Bewertungen (strukturierte Scores; optional Freitext). Bezug zur
              Gruppe/Universität/zum Jahr, ohne deinen Namen öffentlich
              auszuweisen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Betrieb
              eines unabhängigen Bewertungsportals).
            </li>
            <li>
              <strong>Verarbeitung personenbezogener Daten der bewerteten Personen:</strong>{" "}
              Namen, Funktionen und veröffentlichte Profile von Betreuenden,
              soweit dies für die Bewertung erforderlich ist. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. f DSGVO (Meinungs- und Informationsfreiheit /
              berechtigtes Informationsinteresse der Studierenden).
            </li>
            <li>
              <strong>Verifizierungsdokumente</strong> (z.B. Betreuungs­vereinbarung,
              Annahme als Doktorand:in) werden <strong>nur geprüft</strong>;
              das Original wird unmittelbar nach Prüfung verworfen und
              <em> nicht gespeichert</em>. Wir vermerken lediglich, dass die
              Verifizierung erfolgreich war. (§9 verify-then-discard.)
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Empfänger</h2>
          <p className="mt-1">
            Hosting und Datenbank: Supabase (Auftragsverarbeitung; ⚖️ AVV
            bestätigen). Keine Weitergabe an Dritte zu Werbezwecken.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Speicherdauer</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Konto: bis zur Löschung durch dich.</li>
            <li>
              Erfahrungsberichte: solange sie veröffentlicht sind. Nach
              Löschung deines Kontos werden Berichte anonymisiert (Verknüpfung
              zur Person entfernt).
            </li>
            <li>Beschwerden / Takedown-Vorgänge: 3 Jahre, zur Beweisführung.</li>
            <li>Verifizierungsdokumente: nicht gespeichert (siehe oben).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Deine Rechte</h2>
          <p className="mt-1">
            Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
            Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch
            (Art. 21). Anfragen an die im Impressum genannte Adresse.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            6. Hinweise für bewertete Personen
          </h2>
          <p className="mt-1">
            Wenn du dich von einem Bericht betroffen siehst, kannst du das{" "}
            <a href="/meldung">Meldeformular</a> nutzen. Wir führen ein
            strukturiertes Notice-and-Takedown-Verfahren durch (§7 Spec).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p className="mt-1">
            Du kannst dich an eine Datenschutzaufsichtsbehörde wenden, z.B. die
            für unseren Sitz zuständige Behörde.
          </p>
        </div>
      </section>
    </div>
  );
}
