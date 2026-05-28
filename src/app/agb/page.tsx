export const metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Allgemeine Nutzungsbedingungen
      </h1>

      <div className="mt-4 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[var(--warning-text)]">
        ⚖️ <strong>Entwurf.</strong> Vor öffentlichem Launch durch eine:n Anwält:in
        zu prüfen. Die folgenden Punkte spiegeln die Plattform-Prinzipien aus §2
        wider.
      </div>

      <section className="mt-8 space-y-5 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">1. Gegenstand</h2>
          <p className="mt-1">
            PromotionsHub ist eine unabhängige Plattform, auf der (a) offene
            medizinische Doktorarbeit-Stellen veröffentlicht werden und (b)
            Studierende ihre Erfahrungen mit Gruppen und Betreuer:innen teilen.
            Die Plattform ist neutraler Host fremder Inhalte und macht sich
            Beiträge nicht zu eigen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Konto und Verifizierung</h2>
          <p className="mt-1">
            Für das Abgeben einer Bewertung ist eine verifizierte
            E-Mail-Adresse erforderlich. Universitätsadressen werden zusätzlich
            als „verifizierte Studierende“ markiert. Du sicherst zu, dein Konto
            persönlich zu führen und keine fremden Identitäten zu verwenden.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Pflichten beim Verfassen von Beiträgen</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Berichte geben deine eigene, selbst erlebte Erfahrung wieder.</li>
            <li>Keine Tatsachenbehauptungen ohne tatsächliche Grundlage.</li>
            <li>Keine Beleidigungen, keine Schmähkritik.</li>
            <li>Keine Patient:innendaten, keine Betriebsgeheimnisse.</li>
            <li>Keine personenbezogenen Daten Dritter über das Notwendige hinaus.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Moderation und Notice-and-Takedown</h2>
          <p className="mt-1">
            Freitexte werden vor Veröffentlichung geprüft. Beschwerden
            betroffener Personen werden in einem definierten Verfahren bearbeitet
            (siehe <a href="/meldung">Meldeformular</a>). Wir behalten uns vor,
            Beiträge zu entfernen, die gegen geltendes Recht oder diese
            Bedingungen verstoßen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Neutralität gegenüber bezahlten Inhalten</h2>
          <p className="mt-1">
            Eine Stelle kann gegen Entgelt im Suchergebnis hervorgehoben werden.
            <strong> Bezahlung hat niemals Einfluss</strong> auf
            Bewertungsdarstellung, Reihenfolge der Bewertungen oder die
            Sichtbarkeit negativer Berichte.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Haftung</h2>
          <p className="mt-1">
            PromotionsHub ist nicht Vertragspartner zwischen Stellenanbieter und
            Bewerber:in. Für die Richtigkeit eingereichter Stellen übernehmen
            wir keine Gewähr. Für nutzergenerierte Inhalte haften wir nach den
            allgemeinen Vorschriften (§ 10 TMG, Host-Provider-Privileg).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Schlussbestimmungen</h2>
          <p className="mt-1">
            Es gilt deutsches Recht, ausschließlicher Gerichtsstand ist – soweit
            gesetzlich zulässig – der Sitz des Anbieters.
          </p>
        </div>
      </section>
    </div>
  );
}
