export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>

      <section className="mt-8 text-sm leading-relaxed space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2">
            Carl Pöhl
            <br />
            Oberhaslach 8
            <br />
            88410 Bad Wurzach
            <br />
            Deutschland
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p className="mt-2">
            E-Mail:{" "}
            <a href="mailto:kontakt@promotionshub.de" className="underline underline-offset-4">
              kontakt@promotionshub.de
            </a>
            <br />
            Für Meldungen zu Inhalten steht zusätzlich unser{" "}
            <a href="/meldung" className="underline underline-offset-4">
              Meldeformular
            </a>{" "}
            zur Verfügung.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2">Carl Pöhl, Oberhaslach 8, 88410 Bad Wurzach</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Zentrale Kontaktstelle nach Art. 11, 12 DSA
          </h2>
          <p className="mt-2">
            Für Behörden sowie Nutzer:innen der Plattform:{" "}
            <a href="mailto:kontakt@promotionshub.de" className="underline underline-offset-4">
              kontakt@promotionshub.de
            </a>{" "}
            (Sprachen: Deutsch, Englisch).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Verbraucherstreitbeilegung</h2>
          <p className="mt-2">
            Wir sind nicht bereit und nicht verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen (§ 36 VSBG).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Haftung für Inhalte</h2>
          <p className="mt-2">
            Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen
            Gesetzen verantwortlich. Für fremde, von Nutzer:innen eingestellte
            Inhalte (insbesondere Erfahrungsberichte) gelten die
            Haftungsprivilegien für Hosting-Dienste nach Art. 6 der Verordnung
            (EU) 2022/2065 (Digital Services Act). Wir sind nicht verpflichtet,
            übermittelte oder gespeicherte fremde Informationen allgemein zu
            überwachen (Art. 8 DSA). Bei Kenntnis konkreter Rechtsverletzungen
            entfernen wir betroffene Inhalte umgehend, siehe{" "}
            <a href="/meldung" className="underline underline-offset-4">
              Meldeformular
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
