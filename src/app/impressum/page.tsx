export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>

      <section className="mt-8 text-sm leading-relaxed space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
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
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2">
            Carl Pöhl, Oberhaslach 8, 88410 Bad Wurzach
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">EU-Streitschlichtung</h2>
          <p className="mt-2">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              className="underline underline-offset-4"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Haftung für Inhalte</h2>
          <p className="mt-2">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
            Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
            verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
            jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die
            auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
            Entfernung oder Sperrung der Nutzung von Informationen nach den
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine
            diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
            Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekannt­werden
            von entsprechenden Rechtsverletzungen entfernen wir diese Inhalte
            umgehend — siehe{" "}
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
