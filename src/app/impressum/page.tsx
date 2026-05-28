export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 prose">
      <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>

      <PlaceholderBanner />

      <h2 className="mt-8 text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
      <p className="mt-2 text-sm">
        [Vollständiger Name / Firmenname]
        <br />
        [Straße + Hausnummer]
        <br />
        [PLZ + Ort]
        <br />
        [Land]
      </p>

      <h2 className="mt-6 text-xl font-semibold">Kontakt</h2>
      <p className="mt-2 text-sm">
        E-Mail: [kontakt@promotionshub.de]
        <br />
        Telefon: [optional]
      </p>

      <h2 className="mt-6 text-xl font-semibold">Vertretungsberechtigte Person</h2>
      <p className="mt-2 text-sm">[Name, Funktion]</p>

      <h2 className="mt-6 text-xl font-semibold">Registereintrag</h2>
      <p className="mt-2 text-sm">[Falls UG/GmbH: Registergericht, HRB-Nr.]</p>

      <h2 className="mt-6 text-xl font-semibold">Umsatzsteuer-ID</h2>
      <p className="mt-2 text-sm">[Falls vorhanden]</p>

      <h2 className="mt-6 text-xl font-semibold">
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
      </h2>
      <p className="mt-2 text-sm">[Name + ladungsfähige Anschrift]</p>

      <h2 className="mt-6 text-xl font-semibold">Streitschlichtung</h2>
      <p className="mt-2 text-sm">
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a href="https://ec.europa.eu/consumers/odr/">https://ec.europa.eu/consumers/odr/</a>
        <br />
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </div>
  );
}

function PlaceholderBanner() {
  return (
    <div className="mt-4 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[var(--warning-text)]">
      ⚖️ <strong>Platzhalter.</strong> Diese Seite muss vor öffentlichem Launch
      durch eine:n Anwält:in oder die verantwortliche Person final bestückt
      werden (Pflichtangaben § 5 TMG, MStV; Haftungsvehikel).
    </div>
  );
}
