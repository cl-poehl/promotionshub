export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Datenschutzhinweise</h1>
      <p className="mt-2 text-xs text-stone-500">Stand: Juni 2026</p>

      <div className="mt-4 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[var(--warning-text)]">
        ⚖️ <strong>Entwurf.</strong> Diese Erklärung wird derzeit anwaltlich
        geprüft. Sie beschreibt die tatsächlichen Verarbeitungen der Plattform
        nach bestem Wissen.
      </div>

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">1. Verantwortlich</h2>
          <p className="mt-1">
            Carl Pöhl, Oberhaslach 8, 88410 Bad Wurzach,{" "}
            <a href="mailto:kontakt@promotionshub.de">kontakt@promotionshub.de</a>{" "}
            (siehe <a href="/impressum">Impressum</a>).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Welche Daten wir verarbeiten</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Beim Besuch der Seite:</strong> IP-Adresse, Datum/Uhrzeit,
              aufgerufene Seite, Browser-Typ (Server-Logs unseres Hosters, siehe
              Ziffer 4). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an Betrieb und Sicherheit der Plattform).
              Logs werden automatisch nach kurzer Zeit gelöscht.
            </li>
            <li>
              <strong>Konto:</strong> E-Mail-Adresse (Pflicht), Login-Zeitpunkte,
              Session-Cookie. Anmeldung erfolgt per E-Mail-Link („Magic Link"),
              wir speichern kein Passwort. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
              DSGVO (Nutzungsvertrag) bzw. lit. f (Account-Sicherheit).
            </li>
            <li>
              <strong>Erfahrungsberichte:</strong> die von dir eingegebenen
              Bewertungen (strukturierte Scores; optional Freitexte) mit Bezug zu
              Gruppe/Klinik und Zeitraum. Dein Name und deine E-Mail-Adresse
              werden niemals neben einer Bewertung angezeigt. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. f DSGVO (Betrieb eines unabhängigen
              Bewertungsportals; Meinungs- und Informationsfreiheit).
            </li>
            <li>
              <strong>Quiz („Doktorarbeit finden"):</strong> deine Antworten
              werden ausschließlich in deinem Browser bzw. in der URL verarbeitet
              und nicht auf unseren Servern gespeichert.
            </li>
            <li>
              <strong>Meldungen / Beschwerden:</strong> die im Meldeformular
              angegebenen Daten, zur Durchführung des
              Notice-and-Takedown-Verfahrens. Rechtsgrundlage: Art. 6 Abs. 1
              lit. c und f DSGVO.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Cookies</h2>
          <p className="mt-1">
            Wir setzen ausschließlich <strong>technisch notwendige Cookies</strong>{" "}
            ein (Session-/Auth-Cookies von Supabase, nur nach Anmeldung). Keine
            Tracking-, Analyse- oder Werbe-Cookies; keine Einwilligung
            erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Schriftarten werden von
            unserem eigenen Server geladen, nicht von Google.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Empfänger / Auftragsverarbeiter</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Vercel Inc.</strong> (USA): Hosting und Auslieferung der
              Webseite; Server-Funktionen werden in Frankfurt (EU) ausgeführt.
              Auftragsverarbeitung mit EU-Standardvertragsklauseln; Vercel ist
              unter dem EU-US Data Privacy Framework zertifiziert.
            </li>
            <li>
              <strong>Supabase</strong>: Datenbank und Authentifizierung;
              Projekt-Region: EU (Irland). Auftragsverarbeitung.
            </li>
            <li>
              <strong>Resend</strong> (USA): Versand der Anmelde-E-Mails;
              Versand erfolgt über EU-Infrastruktur (Irland).
              Auftragsverarbeitung mit EU-Standardvertragsklauseln.
            </li>
          </ul>
          <p className="mt-1">Keine Weitergabe an Dritte zu Werbezwecken.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Speicherdauer</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Server-Logs: automatische Löschung durch den Hoster nach kurzer Frist.</li>
            <li>Konto: bis zur Löschung durch dich.</li>
            <li>
              Erfahrungsberichte: solange sie veröffentlicht sind. Nach Löschung
              deines Kontos werden Berichte anonymisiert (Verknüpfung zu deiner
              Person entfernt).
            </li>
            <li>Beschwerden / Takedown-Vorgänge: 3 Jahre, zur Beweisführung.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            6. Informationen für in Stellenanzeigen genannte Personen
          </h2>
          <p className="mt-1">
            In den Stellen-Einträgen nennen wir Arbeitsgruppen und deren
            Leitungen (Name, akademischer Titel, Funktion, dienstliche
            Kontaktdaten), soweit diese Informationen auf den{" "}
            <strong>öffentlichen Webseiten der Kliniken und Fakultäten</strong>{" "}
            veröffentlicht sind. Quelle und Link sind bei jedem Eintrag
            angegeben. Zweck ist die Information Studierender über offene
            Promotionsstellen; Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Informationsinteresse; die Daten beziehen sich
            ausschließlich auf die berufliche Sphäre). Da die Information aus
            öffentlichen Quellen stammt und eine individuelle Benachrichtigung
            aller genannten Personen einen unverhältnismäßigen Aufwand bedeuten
            würde, erfolgt die Information nach Art. 14 Abs. 5 lit. b DSGVO über
            diese öffentliche Datenschutzerklärung. Du kannst der Nennung
            jederzeit widersprechen oder eine Korrektur verlangen:{" "}
            <a href="mailto:kontakt@promotionshub.de">kontakt@promotionshub.de</a>{" "}
            oder über das <a href="/meldung">Meldeformular</a> bzw. die
            Rückmelde-Funktion am jeweiligen Eintrag.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            7. Hinweise für bewertete Personen
          </h2>
          <p className="mt-1">
            Erfahrungsberichte beziehen sich auf die berufliche Tätigkeit
            (Betreuung von Doktorarbeiten) von Gruppen und, erst nach
            erhöhten Schwellen und gesondertem Verfahren, einzelnen
            Betreuer:innen. Wenn du dich von einem Bericht betroffen siehst,
            kannst du das <a href="/meldung">Meldeformular</a> nutzen. Wir
            führen ein strukturiertes Notice-and-Takedown-Verfahren durch.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">8. Deine Rechte</h2>
          <p className="mt-1">
            Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
            Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch
            (Art. 21 DSGVO). Anfragen an{" "}
            <a href="mailto:kontakt@promotionshub.de">kontakt@promotionshub.de</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">9. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p className="mt-1">
            Zuständig ist der Landesbeauftragte für den Datenschutz und die
            Informationsfreiheit Baden-Württemberg (LfDI BW), Lautenschlagerstraße
            20, 70173 Stuttgart,{" "}
            <a
              href="https://www.baden-wuerttemberg.datenschutz.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              baden-wuerttemberg.datenschutz.de
            </a>
            . Du kannst dich auch an jede andere Datenschutzaufsichtsbehörde
            wenden.
          </p>
        </div>
      </section>
    </div>
  );
}
