"""
Generiert aus den extracted/*.json einen TypeScript-Sources-Block für
scripts/importers/tu-dresden/sources.ts.

Heuristiken:
- thesis_type wird per Stichwort-Match abgeleitet.
- Title wird normalisiert (kürzbar).
- Body wird auf 700 Zeichen geschnitten (am Satz-Ende), Quell-URL angehängt.

Manuell zu pflegen (in CLINICS-Dict unten):
- groupName  (kanonischer Klinikname für die DB)
- specialty
- applicationContact (Email/Telefon, falls bekannt)

Output: stdout (TypeScript-Array-Elemente).
Aufruf: python build_sources.py > generated_sources.ts.txt
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
EXTRACTED = HERE / "extracted"

# ---------------------------------------------------------------------------
# MANUAL_OVERRIDES: Für Kliniken, deren öffentliche Seiten weniger reiche
# AG-Subpages haben als die Hauptseite. Hier kuratierte Listen, die statt
# der crawl-Ableitung verwendet werden. Der Crawl-Output wird ignoriert.
# ---------------------------------------------------------------------------
MANUAL_OVERRIDES: dict[str, list[dict]] = {
    "neurologie": [
        dict(
            title="AG Akgün — Neuroimmunologisches Labor (Neurologie UKD Dresden)",
            thesis_type="experimental",
            description="""Translationale neuroimmunologische Forschung: Mechanismen von Erkrankungen wie Multipler Sklerose, therapeutische Modulation und **Biomarker für die klinische Praxis**.

## Methoden im Labor
Zellkultur, FACS, automatisierte ELISA, automatische Zellsortierung, **Real-time Deformability Cytometry (RT-DC)**, HD1-Analyzing, molekulare Messverfahren, Immunhistochemie — an murinen und humanen Bioproben.

## Aktiv
Sehr großes Team mit ~18 aktuellen Doktorand:innen — gleichzeitig betreut, also Mentorenstruktur etabliert.

**Leitung:** Prof. Dr. med. Katja Akgün

*Sehr gute Wahl für klassisches Wet-Lab-Promotionsprojekt in der Neuroimmunologie. Mehrere Monate Vollzeit-Labor erforderlich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neuroimmunologie/ag-akguen",
            contact="Prof. Dr. med. Katja Akgün (Neurologie-Sekretariat)",
        ),
        dict(
            title="AG Barlinn — Hämorrhagischer Schlaganfall (Neurologie UKD Dresden)",
            thesis_type="clinical",
            description="""Klinische Forschung zu **hämorrhagischem Schlaganfall** und irreversiblem Hirnfunktionsausfall.

## Laufende Projekte
- **DOAC-HE:** Impact of DOAC plasma levels on hematoma expansion
- **DOAC-EVT:** DOAC-Spiegel vor endovaskulärer Therapie bei Verschluss großer Gefäße
- **DETECT-IVE:** Automatisiertes Screening auf Hirnschäden — interventionelle Cluster-RCT
- **VISTA-BD:** Visually-Assisted Neurological Assessment für die Beurteilung des Hirntods (Pilotstudie)

**Leitung:** Prof. Dr. med. Kristian Barlinn

[Publikationen auf PubMed](https://pubmed.ncbi.nlm.nih.gov/?term=Barlinn+K&sort=date)

*Geeignet für klinische Promotionen mit Schlaganfall-Schwerpunkt — Mitarbeit an laufenden Multicenter-RCTs möglich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neurovaskulaere-forschung/ag-barlinn",
            contact="Prof. Dr. med. Kristian Barlinn (Neurologie-Sekretariat)",
        ),
        dict(
            title="AG Huttner-Vaid — Neurale Regeneration (Neurologie UKD Dresden)",
            thesis_type="experimental",
            description="""**Decoding the Neurogenic Blueprint** — integriert vergleichende Entwicklungsbiologie, adulte Neurogenese und regenerative Biologie zu einem einheitlichen Konzept.

## Forschungsfokus
- Zerebrovaskuläre Erkrankungen, insbesondere Schlaganfall
- Endogene Reparatur­mechanismen, die noch nicht für vollständige Erholung ausreichen
- Konservierte regulatorische Netzwerke neuraler Stamm-/Vorläuferzellen
- **Ziel:** therapeutische Strategien für Neuroregeneration

## Modellsysteme
Tiermodelle + Stammzell-basierte Modelle für mammale corticale Neurogenese aus entwicklungs- und evolutionsbiologischer Perspektive.

*Englisch-sprachiges Lab. Geeignet für anspruchsvolle experimentelle Promotionen an der Schnittstelle Entwicklungsbiologie / Stammzellforschung / Neurologie.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/ag-huttner-vaid",
            contact="AG Huttner-Vaid (Neurologie-Sekretariat)",
        ),
        dict(
            title="AG Pütz — Ischämischer Schlaganfall (Neurologie UKD Dresden)",
            thesis_type="clinical",
            description="""Klinische und bildgebende Forschung zum **ischämischen Schlaganfall**. Schwerpunkt: was bestimmt das Therapie-Ansprechen und Outcome.

## Forschungsthemen
- Systemische Lysetherapie und endovaskuläre Therapie
- Pathophysiologische Vorgänge, die zu Schlaganfällen führen

## Aktive Projekte (Auswahl)
- Bildgebende Parameter bei akuter **A.-basilaris-Thrombose** (BASICS/VERITAS-Studien)
- Einfluss peri-interventioneller **Intubationsnarkose** auf Outcome nach Thrombektomie
- Prävalenz **tiefer Beinvenenthrombose** bei ischämischem Schlaganfall mit Rechts-Links-Shunt
- Lambl'sche Exkreszenzen bei akutem Hirninfarkt
- **Obstruktives Schlafapnoe-Screening** an der Neurovaskulären Untersuchungs­einheit

**Leitung:** Prof. Dr. med. Volker Pütz, FESO

*Sehr gut für klinisch-bildgebende Promotionen — Anbindung an internationale Studiengruppen.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neurovaskulaere-forschung/ag-puetz",
            contact="Prof. Dr. med. Volker Pütz (Neurologie-Sekretariat)",
        ),
        dict(
            title="AG Siepmann — Translationale Schlaganfall-Forschung (Neurologie UKD Dresden)",
            thesis_type="clinical",
            description="""Klinische und translationale Forschung zu zerebrovaskulären Erkrankungen, mit Schwerpunkt **akuter ischämischer Schlaganfall**.

## Schlüssel-Forschungsbereiche
- **Modulating Outcomes in Thrombectomy:** neuroprotektive Targets gegen Reperfusionsschäden, Effekt der systemischen Thrombolyse vor Thrombektomie
- **Sekundärprävention:** verstärkte Plättchen­hemmung, Lipid-Senkung, Lifestyle-Strategien
- **Humane Pharmakologie-Modelle:** Mikrozirkulation, sympathische Funktion, vaskuläre Reaktivität, endotheliale Funktion
- **Heart-Brain Axis:** bidirektionale Interaktion zwischen Herz- und Hirn-Ereignissen, kardiale Schlaganfall­ursachen, autonome Funktion

**Leitung:** Prof. Dr. med. Timo Siepmann, FAHA, FESO

*International orientiert (englischsprachige Arbeit möglich), translationaler Stil. Geeignet für klinische bis humanphysiologische Promotionen.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neurovaskulaere-forschung/ag-siepmann",
            contact="Prof. Dr. med. Timo Siepmann (Neurologie-Sekretariat)",
        ),
        dict(
            title="Interdisziplinäres Schlaflabor (Neurologie UKD Dresden)",
            thesis_type="clinical",
            description="""Klinisches Schlaflabor mit Tagesklinik — schlafmedizinische Diagnostik und Therapie aller Schlafstörungen.

## Forschungsthemen
- Schlafstörungen als eigenständige Erkrankung **und** im Rahmen anderer Erkrankungen (internistisch, neurologisch, psychiatrisch)
- Zusammenhänge zwischen gestörtem Schlaf und:
  - Herz-Kreislauf-Erkrankungen (Herzinfarkt, Schlaganfall)
  - Neurodegeneration (Demenz, Parkinson)
  - Stoffwechselerkrankungen (Adipositas, Diabetes)
- Diagnostik und Behandlung in der **Neurologischen Schlafambulanz**

## Format
DGSM-zertifiziert. Klinische Promotionen mit echten Patient:innen-Daten und multimodaler Diagnostik (Polysomnographie etc.).

*Gut für klinisch-statistische Promotionen mit Schlafmedizin-Schwerpunkt — viele Berührungspunkte zu Innerer Medizin und Psychiatrie.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/schlafmedizin/interdisziplinaeres-schlaflabor",
            contact="Schlaflabor / Neurologie-Sekretariat (0351 458-0)",
        ),
        dict(
            title="AG eHealth & Analytics — MS-Forschung (Neurologie UKD Dresden)",
            thesis_type="statistical",
            description="""Forschungsgruppe am **Zentrum für klinische Neurowissenschaften (ZKN)** mit Schwerpunkt MS und digital unterstütztes Patient:innen-/Krankheits­management.

## Tätigkeiten
- Digitale Werkzeuge zur Verlaufs- und Therapiemessung bei Multipler Sklerose
- Planung und Auswertung klinischer und non-klinischer Studien
- **Elaborierte statistische und psychometrische Verfahren**

**Ansprechpartner:** Prof. Dr. med. Tjalf Ziemssen

[Website eHealth & Analytics](https://zkn.uniklinikum-dresden.de/zkn/masc/ehealth)

*Sehr gut für Promotionen mit Daten-Analyse-Schwerpunkt — Schnittstelle Statistik, MS-Klinik und Digital Health.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neuroimmunologie/multiple-sklerose-forschung",
            contact="Prof. Dr. med. Tjalf Ziemssen (Neurologie-Sekretariat)",
        ),
        dict(
            title="Schwerpunkt Neurodegeneration — Parkinson & Demenz (Neurologie UKD Dresden)",
            thesis_type="experimental",
            description="""Bündelt zwei AGs für die Erforschung neurodegenerativer Erkrankungen.

## AG Parkinson-Forschung (Prof. Falkenburger)
- Zell- und Tiermodelle, neue molekulare Behandlungsziele
- **Seed-Amplifikationstests** zur Messung der Lewy-Pathologie in Biomaterialien (z.B. Liquor)
- Beobachtungs- und Interventionsstudien an Patient:innen
- **Digitale Biomarker** für Klinik und Forschung

## AG Neurodegenerative Demenzen
- Untersuchung der Pathomechanismen
- Anbindung an klinische Studien

**Ansprechpartner:** Prof. Dr. med. Björn Falkenburger

*Spektrum von experimenteller Promotion (Tiermodelle, Biomarker) bis zu klinischen Studien. Sehr stark mit dem **Universitäts-ParkinsonCentrum Dresden** verzahnt.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neurodegeneration",
            contact="Prof. Dr. med. Björn Falkenburger (Neurologie-Sekretariat)",
        ),
        dict(
            title="Autonomes und neuroendokrines Funktionslabor (Neurologie UKD Dresden)",
            thesis_type="experimental",
            description="""Spezialisiertes Funktionslabor mit eigenständigem Doktoranden-Programm.

## Aktive Projekte
- **Autonome Störungen** bei extrapyramidalen Erkrankungen
- **Pathophysiologie von Pupillenstörungen** bei verschiedenen neurologischen Erkrankungen

**Hinweis der Klinik:** „Im Labor besteht die Möglichkeit, wissenschaftliche Untersuchungen für eine medizinische Doktorarbeit durchzuführen. Bitte aktuell nach momentanen Projekten nachfragen!"

**Ansprechpartner:** Prof. Dr. med. T. Ziemssen

[Labor-Homepage (ZKN)](https://zkn.uniklinikum-dresden.de/zkn/anf)

*Klein, fokussiert, mit explizit ausgesprochener Bereitschaft, Doktorarbeiten zu betreuen — gute erste Adresse für eine Anfrage.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie/forschung/neuroimmunologie/autonomes-und-neuroendokrines-funktionslabor",
            contact="Prof. Dr. med. Tjalf Ziemssen (Neurologie-Sekretariat)",
        ),
    ],
    "psy": [
        dict(
            title="Forschungsbereich Affektive Erkrankungen (Psychiatrie UKD Dresden)",
            thesis_type="clinical",
            description="""Großer Forschungsbereich rund um affektive Störungen (Depression, bipolare Erkrankungen) — von Grundlagen bis Versorgung.

## Sieben Sub-AGs unter einem Dach
- **Bipolare Störungen** (Leitung Prof. M. Bauer, PD Dr. P. Ritter)
- **Digitale Phänotypisierung** affektiver Störungen (Dr. V. Ludwig, Prof. M. Bauer) — Smartphone- und Sensor-basierte Verlaufsmessung
- **Entwicklungsverläufe affektiver und psychotischer Symptome** — DevTraP-Lab (PD Dr. E. Mennigen)
- **Klinische Psychopharmakologie** (Prof. M. Bauer, PD Dr. P. Ritter)
- **Präzisionspsychiatrie** (PD Pavol Mikolas, PhD)
- **Suizidforschung** (Prof. U. Lewitzka)
- **Translationale Chronopsychiatrie** (PD Dr. P. Ritter)

**Bereichsleitung:** Prof. Dr. med. Dr. rer. nat. Michael Bauer

*Geeignet, wenn du eine klinische, datengetriebene oder digitale Promotion in der Psychiatrie suchst — das Spektrum reicht von Patient:innen-Outcomes bis zu Smartphone-basierter Phänotypisierung.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/forschungsbereich-affektive-stoerungen",
            contact="Prof. Dr. med. Dr. rer. nat. Michael Bauer · psy-Sekretariat",
        ),
        dict(
            title="AG Dynamische Gehirnzustände und Bildgebung (Psychiatrie UKD Dresden)",
            thesis_type="experimental",
            description="""AG innerhalb der Sektion Systemische Neurowissenschaften, eng mit der Fakultät Psychologie und dem **Neuroimaging Center (NIC)** der TU Dresden verbunden.

## Forschungsfokus
- Hirnzustände im Kontext von **Emotionen, kognitiver Kontrolle und Sucht**
- Wie sich Gehirnzustände auf Zeitskalen von Sekunden bis Jahren ändern
- Entwicklung besserer Bildgebungs-Methoden (Reproduzierbarkeit, Spezifität)
- **Machine Learning** zur Vorhersage-Optimierung

**Infrastruktur:** NIC der TUD + Zentrum für Hochleistungsrechnen (ZIH)

**Leitung:** Michael Marxen, PhD

[Mehr auf der TUD-Gruppen-Seite](https://tu-dresden.de/bereichsuebergreifendes/nic/research/grps_med/brain-dynamics-group)

*Geeignet, wenn dich fMRT, Machine Learning für Bildgebung und/oder Sucht-/Emotionsforschung reizen — methodisch anspruchsvoll, technische Vorkenntnisse helfen.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/dynamische-gehirnzustaende-und-bildgebungsmethoden",
            contact="Michael Marxen, PhD (Kontakt über AG-Seite)",
        ),
        dict(
            title="Forschungsbereich Neurobiologie psychischer Störungen (Psychiatrie UKD Dresden)",
            thesis_type="experimental",
            description="""Experimentelle Erforschung der neurobiologischen Grundlagen psychiatrischer Erkrankungen — wie genetische Risikofaktoren und Umwelteinflüsse die Gehirnentwicklung formen.

## Methodenvielfalt
- Etablierte **Tiermodelle** und neuromodulatorische Verfahren
- Verhaltensforschung, Molekularbiologie, Biochemie, Immunologie
- **Bildgebung (MRT)**, Pharmakotherapie, Elektrophysiologie
- Translation: präklinische Befunde ↔ humanmedizinische Daten
- Eigene **Labore für Neurobioanalytik** + Bioprobenaufbereitung mit dem Studienzentrum

**Schwerpunkt:** präventive und krankheits­modifizierende Interventionen identifizieren

**Leitung:** PD Dr. Nadine Bernhardt, PhD

*Klassische experimentelle Promotion — Wet Lab + Tiermodelle + Bildgebung. Mehrere Monate Vollzeit-Labor erforderlich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/forschungsbereich-neurobiologie-psychischer-stoerungen",
            contact="PD Dr. Nadine Bernhardt, PhD (Kontakt über AG-Seite)",
        ),
        dict(
            title="AG Psychiatrische Epidemiologie und Verlaufsforschung (Psychiatrie UKD Dresden)",
            thesis_type="statistical",
            description="""Drei Themen unter einem Dach: Früherkennung, Evidenzbasierung, innovative Versorgungsansätze.

## Forschungsachsen
- **(A) Früherkennung:** Entstehungsprozesse psychischer Störungen bei jungen Menschen — Veränderungen in Risiko- und Frühphasen erkennen, schwere Verläufe verhindern
- **(B) Evidenzbasierung:** Diagnostik- und Behandlungsleitlinien, Entscheidungsprozesse
- **(C) Versorgungsinnovation:** neuartige Versorgungs­ansätze in der Psychiatrie

## Methoden
- Quantitative und qualitative Epidemiologie
- **Langzeitbeobachtung** inkl. Smartphone-basiertem Monitoring
- Bildgebung, qualitative Erhebungstechniken
- **KI-basierte Analyseansätze**

**Leitung:** Prof. Dr. med. Andrea Pfennig

*Sehr gut für statistisch-epidemiologische Promotionen — etablierte Längsschnitt-Daten, eng verzahnt mit anderen psy-AGs am UKD.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/forschungsbereich-psychiatrische-epidemiologie-und-verlaufsforschung-1",
            contact="Prof. Dr. med. Andrea Pfennig (Sekretariat psy)",
        ),
        dict(
            title="AG Klinische Suchtforschung (Psychiatrie UKD Dresden)",
            thesis_type="clinical",
            description="""Untersucht klinisch relevante Fragen rund um **stoffgebundene Suchterkrankungen** — Alkohol und Stimulanzien im Fokus.

## Schwerpunkte
- Multimodale Forschungsmethoden zu Alkohol- und Methamphetamin-Abhängigkeit
- Klinische und soziodemografische Wirkfaktoren multimodaler Behandlungs­konzepte
- Regionale Besonderheiten Sachsens (hohe Raten methamphetamin- und alkohol­abhängiger Menschen)
- Internationale Vernetzung in als führend eingestuften Forschungsprojekten

**Leitung:** Prof. Dr. med. habil. Maximilian Pilhatsch + PD Dr. med. Dr. rer. medic. habil. Johannes Petzold

*Geeignet, wenn dich Suchtmedizin als klinisches Forschungsfeld interessiert — sowohl Outcome- als auch Therapie-Forschung möglich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/forschungsbereich-suchterkrankungen",
            contact="Prof. Dr. M. Pilhatsch / PD Dr. J. Petzold (psy-Sekretariat)",
        ),
        dict(
            title="AG Translationale Suchtforschung (Psychiatrie UKD Dresden)",
            thesis_type="experimental",
            description="""Analysiert **neurobiologische, psychologische und pharmakologische** Prozesse hinter dem Gebrauch psychoaktiver Substanzen. Ziel: Grundlagenforschung + Klinik zusammenführen.

## Methodischer Kern
- **Humanlaborstudien** mit computergesteuerter Alkoholinfusion (teils als klinische Prüfungen nach AMG)
- Präzises Steuern von Alkoholkonsum unter sicheren Bedingungen, um Medikamenten­wirkung auf Trinkverhalten zu prüfen
- Schnelle Translation präklinischer Befunde an den Menschen

## Aktuelle Themen
- Pharmakologische Therapieansätze gegen Alkoholabhängigkeit
- **Cannabis und Fahrsicherheit** — Kooperation mit der TUD-Professur für Kraftfahrzeugtechnik (THC-Einfluss auf kognitive + fahrtechnische Leistung)

**Leitung:** Dr. med. Maik Spreer

*Spannend für experimentell-translationale Promotionen — Studienteilnahme an realen Pharmastudien möglich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/translationale-suchtforschung",
            contact="Dr. med. Maik Spreer (psy-Sekretariat)",
        ),
        dict(
            title="Forschungsbereich Systemische Neurowissenschaften (Psychiatrie UKD Dresden)",
            thesis_type="experimental",
            description="""Verbindet **kognitive und computationale Neurowissenschaften** mit klinischer Forschung — Schwerpunkt: Mechanismen hinter Suchterkrankungen und transdiagnostischen Defiziten.

## Forschungsfragen
- Exekutive Funktionen, motivationale, Lern- und Entscheidungsprozesse
- Funktion neuronaler Systeme (z.B. Belohnungssystem) per **fMRT** während Aufgaben (z.B. Delay-Discounting)
- Struktur-Funktions-Zusammenhänge per **strukturelles MRT**
- Neuromodulatoren (Dopamin, Serotonin) per **PET** + Kombination mit fMRT
- Transdiagnostischer Ansatz über Suchterkrankungen hinaus

## Methoden
fMRT, sMRT, PET, computationale Modellierung, Verhaltensparadigmen

**Leitung:** Prof. Dr. med. Michael N. Smolka

[TUD-NIC-Sektion](https://tu-dresden.de/bereichsuebergreifendes/nic/research/grps_med/sesyn)

*Anspruchsvolle bildgebungs- und modellierungs­basierte Promotion. Methodisches Interesse an MRT/PET hilfreich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/systemische-neurowissenschaften",
            contact="Prof. Dr. med. Michael N. Smolka (psy-Sekretariat)",
        ),
        dict(
            title="AG Verlauf psychischer Störungen in Transitionsphasen (Psychiatrie UKD Dresden)",
            thesis_type="statistical",
            description="""Interdisziplinäre AG zur **epidemiologischen Verlaufsuntersuchung** psychischer Störungen in wichtigen Lebensübergängen.

## Drei Transitionsphasen im Fokus
- **(A) Übergang zur Elternschaft** — peripartale Psychiatrie, Schwangerschaft & Wochenbett
- **(B) Adoleszenz → Erwachsenenalter**
- **(C) Psychische Veränderungen bei schwerer Krankheit**

## Methodik
- Längsschnitt-, Kohorten- und Bevölkerungs­studien
- Multi-methodaler Ansatz: individuelle, familiäre, Umwelt-Faktoren
- Entwicklung innovativer diagnostischer Instrumente
- Integration in die Spezialsprechstunden der Klinik

**Leitung:** Prof. Dr. rer. nat. habil. Julia Martini

*Geeignet für epidemiologisch-statistische Promotionen mit Lebensphasen-Bezug. Pro­motionen mit peripartal-psychiatrischem Schwerpunkt besonders gefragt.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/verlauf-psychischer-stoerungen-in-transitionsphasen",
            contact="Prof. Dr. Julia Martini (psy-Sekretariat)",
        ),
        dict(
            title="Klinisches Studienzentrum für psychische Erkrankungen (Psychiatrie UKD Dresden)",
            thesis_type="clinical",
            description="""Bündelt **alle klinischen Studienaktivitäten** der Psychiatrie nach CTR (EU 536/2014) und MDR (EU 2017/745). Enge Verzahnung mit der AG Klinische Psychopharmakologie.

## Schwerpunkte aktiver Studien
- Unipolare Depression
- Bipolare Störungen
- Therapieresistente Verläufe
- Suchterkrankungen
- ADHS im Erwachsenenalter

## Aktuelle Lage
Vier industrie­geförderte Studienprojekte laufen, weitere in Planung. Multidisziplinäres Team mit Studien­assistenz und regulatorischer Expertise.

**Leitung:** PD Dr. med. habil. Philipp Ritter (stellv. Prof. Dr. Dr. Michael Bauer)

*Geeignet, wenn du klinische Forschung im Industriestudien-Setup kennenlernen willst — auch Mitarbeit ohne eigene Doktorarbeit möglich (HiWi/Studienassistenz).*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/studienzentrum",
            contact="PD Dr. med. habil. Philipp Ritter (Studienzentrum psy)",
        ),
        dict(
            title="AG Psychiatrische Versorgungsforschung (Psychiatrie UKD Dresden)",
            thesis_type="statistical",
            description="""Untersucht, wie die Versorgung psychisch erkrankter Menschen **unter Alltagsbedingungen** tatsächlich funktioniert.

## Schwerpunkte
- Evaluation definierter Versorgungs­strukturen und -maßnahmen
- Qualität der Versorgung spezifischer Populationen
- Entwicklung von Dokumentations- und Erhebungs­instrumenten
- Aktuell: Versorgung von Menschen mit intellektueller Beeinträchtigung; Vorbereitung der **Psychiatrieberichterstattung Sachsen**

## Format der Mitarbeit
Drittmittel-finanzierte Studien sowie Master­arbeiten/Promotionen über Eigenmittel oder kleinere Eigeninitiativen.

**Leitung:** apl. Prof. Dr. sc. hum. habil. Matthias Schützwohl, Dipl.-Psych.

*Geeignet für klinisch-statistische Promotionen mit Public-Health-/Versorgungs-Bezug. Auch Master- und Diplomarbeiten möglich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy/forschung-und-lehre/forschungsbereiche-1/forschungsbereich-psychiatrische-versorgungsforschung-1",
            contact="apl. Prof. Dr. Matthias Schützwohl (psy-Sekretariat)",
        ),
    ],
    "mk1": [
        dict(
            title="AG AI in Cancer (MK1 UKD Dresden)",
            thesis_type="statistical",
            description="""Interdisziplinäre Forschungsgruppe an der Schnittstelle Medizin und Informatik. Ziel ist es, die Diagnostik und Therapie in Hämatologie und Onkologie mit Hilfe von KI deutlich zu verbessern.

## Was wir machen
- Computergestützte Entscheidungsfindung in der Onkologie
- Personalisierte Diagnostik und Therapie
- Auswertung „Big Data" aus präklinischer und klinischer Forschung

**Methoden:** Machine Learning, klinische Datenanalyse, Multi-omics-Integration

**Leitung:** Dr. med. Jan Moritz Middeke

**Externer Auftritt:** [ai-in-cancer.org](https://ai-in-cancer.org/)

*Geeignet, wenn dich Programmieren reizt und du Medizin mit Informatik verbinden willst — auch ohne fortgeschrittene Vorkenntnisse, mit Einarbeitungszeit.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/ag-ai-in-cancer",
            contact="Dr. med. Jan Moritz Middeke · Tel. 0351 458-15603",
        ),
        dict(
            title="AG Improvements in clinical cellular immunotherapies (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""Klinisch-experimentelle Arbeitsgruppe zu **anti-neoplastischen Immune Effector Cell Therapien (IECs)** — insbesondere CAR-T-Zellen und Makrophagen.

## Forschungsschwerpunkte
- Hämatotoxische Spätfolgen von Zelltherapien (IEC-associated protracted hematotoxicity)
- Rolle mesenchymaler Stromazellen (MSCs) im Knochenmark-Mikromilieu bei Steroid-refraktärer Graft-versus-Host-Disease (GvHD)
- Makrophagen als neue zelluläre Therapie gegen Krebs

**Methoden:** Zellkultur, Flowzytometrie, Bone-Marrow-Mikromilieu-Modelle

**Leitung:** PD Dr. med. Malte von Bonin

**Kooperationen:** Sieweke Lab (CRTD / TU Dresden)

*Geeignet, wenn du eine echte experimentelle Laborzeit von mehreren Monaten einplanen möchtest und translationale Onkologie reizvoll findest.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/ag-improvements-in-clinical-cellular-immunotherapies",
            contact="PD Dr. med. Malte von Bonin (Kontakt über die AG-Seite)",
        ),
        dict(
            title="AG MK1-L01 — Akute Myeloische Leukämie (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""Präklinisch-experimentelle **und** klinisch-translationale Forschung zur Akuten Myeloischen Leukämie (AML). Detektion und Charakterisierung neuartiger Marker und genetischer Aberrationen — sowohl bei Erstdiagnose als auch nach Rezidiv.

## Aktuelle Projekt-Beispiele
- Genetische Aberrationen und neue Marker bei extramedullärer AML
- Prognostische Relevanz genetischer Polymorphismen und Mutationen in AML-Subgruppen
- Bedeutung von **TET2**-Mutationen bei der AML
- HLA-restringierte Rezidivmechanismen nach allogener Stammzelltransplantation
- Mutationsmuster in zytogenetisch definierten Subgruppen
- Marker bei der Akuten Promyelozytenleukämie (APL)
- MSC-Charakterisierung und -Modulation bei myeloischen Neoplasien

**Kooperationen:** enge Anbindung an das [Stemcell Lab](http://stemcell-lab-mk1dresden.de) auf dem Campus.

*Mehrere unterschiedliche Promotionsprojekte verfügbar — bei Interesse direkt anfragen.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/ag-mk1-l01",
            contact="MK1-L01 · Tel. 0351 458-2699",
        ),
        dict(
            title="AG Myelodysplastische Syndrome (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""**Dresden MDS Working Group** — translationale Forschung zu Myelodysplastischen Syndromen mit dem Ziel, neue Therapie­strategien zu entwickeln und die Pathobiologie der Erkrankung zu verstehen.

## Hauptthemen
- Inflammatorische Pfade in MDS, mit Schwerpunkt **S100A8/9**
- Metabolische Signaturen in zellulären und humoralen Kompartimenten
- Rolle des **Mikrobioms** in der MDS-Pathobiologie
- Neuartige Diagnostik

**Akkreditierung:** „MDS Center of Excellence" der [MDS Foundation](https://www.mds-foundation.org/).

**Kooperationen:** Dresden Stem Cell Lab, Institut für Klinische Chemie, AG „AI in Cancer", AG „Oncomechanics" (TUD/BIOTEC), German MDS Study Group, **EMBL Heidelberg**.

**Leitung:** Dr. med. Katja Sockel und Dr. med. Ekaterina Balaian.

*Eine der renommiertesten MDS-Forschungsgruppen in Deutschland — sehr gute Wahl für eine experimentelle Onkologie-Promotion.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/ag-myelodysplastische-syndrome",
            contact="Dr. med. Katja Sockel / Dr. med. Ekaterina Balaian (Kontakt über AG-Seite)",
        ),
        dict(
            title="Dresden School of Clinical Science — Carus Promotionskolleg (MK1 UKD Dresden)",
            thesis_type="other",
            description="""Strukturiertes Förderprogramm der TU Dresden für **Clinician Scientists** und **Medical Scientists**. Begleitet dich von der Promotionsphase bis zur Habilitation.

## Was du bekommst
- Promotionsphase im **Carus Promotionskolleg** oder Verbundforschungsvorhaben
- Geschützte Forschungszeit in Facharzt-/Postdoc-Phase
- Bis hin zum „Advanced Clinician Scientist"
- Interdisziplinäre Plattform Klinik ↔ biomedizinische Grundlagenforschung

**Auswahlverfahren:** kompetitiv.

**Sprecher:** Prof. Dr. med. Ali El-Armouche und Prof. Dr. med. Björn Falkenburger

*Geeignet, wenn du Promotion und wissenschaftliche Karriere strukturiert kombinieren willst — nicht für klassische „Lab-Doktorarbeiten neben dem Studium".*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/forschung-und-innovation/dresden-school-of-clinical-science",
        ),
        dict(
            title="Else Kröner-Fresenius-Zentrum für Digitale Gesundheit (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""Gemeinsame Initiative der TU Dresden und des Universitätsklinikums — gefördert mit **40 Mio. € über 10 Jahre** durch die Else-Kröner-Fresenius-Stiftung. Interdisziplinärer Forschungsraum für medizinische und digitale Technologien an der direkten Patient:innen-Schnittstelle.

## Vier Professuren
- **Medical Nanotechnology** — Prof. Dr. Larysa Baraban (mit HZDR)
- **Medical Device Regulatory Science** — Prof. Dr. Stephen Gilbert
- **Clinical Artificial Intelligence** — Prof. Dr. med. Jakob N. Kather
- **Electronic Tissue Technologies** — Prof. Dr. Ivan Minev (mit IPF Dresden)

**Förderung:** flexible 2-Jahres-Förderung interdisziplinärer Projekte.

**Mehr:** [digitalhealth.tu-dresden.de](https://digitalhealth.tu-dresden.de/)

*Spannend, wenn du Medizin mit Ingenieurs-Ansätzen (KI, Nanotech, Tissue Engineering) verbinden willst — das EKFZ koordiniert auch das „Clinicum Digitale" für studierende.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/forschung-und-innovation/else-kroener-fresenius-zentrum-fuer-digitale-gesundheit",
        ),
        dict(
            title="Bereich Hämostaseologie — Thrombose- und Blutungsforschung (MK1 UKD Dresden)",
            thesis_type="clinical",
            description="""Zwei klar abgegrenzte klinische Forschungsbereiche der Hämostaseologie. Etablierte Studien-Datensätze, daher gut neben dem Studium machbar.

## AG „Klinische Thromboseforschung"
**Leitung:** Prof. Dr. J. Beyer-Westendorf
- Diagnostik der venösen Thromboembolie
- Prophylaxe und Therapie von Beinvenenthrombose und Lungenembolie
- Antikoagulationstherapie
- Management von Blutungen unter Antikoagulation
- **Registerstudien zu „Alltagsdaten"**

## AG „Hämorrhagische Diathesen"
**Leitung:** Dr. K. Trautmann
- Therapie der Hämophilie und anderer Blutungsstörungen
- Registerstudien zu Alltagsdaten in der Hämophilie

*Geeignet für klinisch-statistische Promotionen mit echten Patient:innendaten — vergleichsweise klar strukturiert, kein Wet Lab.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/bereich-haemostaseologie",
        ),
        dict(
            title="Mildred-Scheel-Nachwuchszentrum — Krebshilfe-Programm (MK1 UKD Dresden)",
            thesis_type="other",
            description="""Von der **Deutschen Krebshilfe** gefördertes Clinician/Medical Scientist Programm „P² — Personalisierte Karriereplanung in der Präzisionsonkologie".

## Was du bekommst
- **Clinician Scientists:** geschützter Forschungsraum während der Facharztausbildung
- **Medical Scientists:** eigene geförderte Arbeitsgruppe für klinik-relevante Fragestellungen
- Tandem-Projekte zwischen Naturwissenschaftler:innen und Mediziner:innen
- Translationale Onkologie-Projekte „from bench to bedside and back"

**Mehr:** [tu-dresden.de/med/mf/msnz](https://tu-dresden.de/med/mf/msnz/)

*Geeignet, wenn du eine onkologische Promotion mit nachfolgender wissenschaftlicher Karriere planst — strukturiertes Förderprogramm, nicht für klassische „Doktorarbeit neben dem Studium".*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/forschung-und-innovation/mildred-scheel-nachwuchszentrum",
        ),
        dict(
            title="Stem Cell Lab 2 (MK1-L11) — Knochenmark-Mikromilieu (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""Translationale Forschung zum **Knochenmark-Mikromilieu („Niche")** bei Myelodysplastischen Syndromen und Akuter Myeloischer Leukämie. Etablierte 2D- und 3D-Kokultur-Modelle.

## Aktuell ausgeschriebene PhD-Projekte
- **Metabolic reprogramming of the hematopoietic microenvironment in AML** (Anastasia Sidorenkova)
- **3D bone marrow niche mimics for drug screening and the development of new therapeutic strategies for AML** (Hannah Botterer)

## Weitere laufende Projekte
- Rolle der extrazellulären Matrix (ECM) bei maligner Transformation
- Monozyten-MSC-Crosstalk im MDS-Mikromilieu
- Stromal-leukämische Zellinteraktionen und Therapieantwort

**Leitung:** Prof. Dr. rer. nat. Manja Wobus

*Echtes Wet Lab. Geeignet, wenn du dich in Zellkultur, Mikroskopie und Stammzell­biologie wirklich vertiefen willst.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/stem-cell-lab-2-mk1-l11",
        ),
        dict(
            title="Transplantation Immunology Lab (AG TxI) — Leukämie nach HCT (MK1 UKD Dresden)",
            thesis_type="experimental",
            description="""Teil des **Exzellenzclusters**, in Kooperation mit der **DKMS**. Erforscht Biologie und Funktion von Immune Effector Cells nach Stammzelltransplantation bei Leukämie-Patient:innen — T-Zellen und Natürliche Killerzellen (NK).

## T-Zell-Forschung
- Identifikation leukämiespezifischer T-Zell-Klone via **Antigen-directed Detection** + Multimer-Technologie
- Charakterisierung der Klone per Multi-Color-Flowzytometrie und Degranulations-Assays
- **TCR-Sequenzierung** funktioneller leukämiespezifischer T-Zellen für die Immuntherapie

## NK-Zell-Forschung
- Rolle von **KIR-Genen** (Killer-cell Immunoglobulin-like Receptor) für die NK-vermittelte Anti-Leukämie-Aktivität
- Optimierung der Spender-Auswahl durch genetische und phänotypische NK-Analyse

**Methoden:** Multi-Color-Flowzytometrie, CyTOF, funktionelle Assays mit primären AML-Blasten

**Leitung:** Prof. Dr. med. Johannes Schetelig

*Anspruchsvolle experimentelle Promotion in einer renommierten Forschungsgruppe. Mehrmonatige Laborphase erforderlich.*""",
            url="https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1/fachabteilungen/haematologie/forschung-research/transplantation-immunology-lab-ag-txi",
            contact="johannes.schetelig@uniklinikum-dresden.de · Tel. 0351 458-15604",
        ),
    ],
    "vtg": [
        dict(title="Klinische Studien (VTG-Chirurgie UKD Dresden)", thesis_type="clinical",
             description="Mitarbeit an klinischen Studien der Viszeral-, Thorax- und Gefäßchirurgie. Auswertung prospektiv und retrospektiv erhobener Patient:innendaten, Studienkoordination. Geeignet für Studierende, die methodisches Arbeiten mit Patient:innendaten lernen wollen. Ansprechpartnerin: Dr. rer. nat. Sarah Zippusch (Doktoranden-Koordination VTG)."),
        dict(title="Digitalisierung in der Medizin / Apps (VTG-Chirurgie UKD Dresden)", thesis_type="clinical",
             description="Doktorarbeiten zu digitalen Gesundheitsanwendungen in der Chirurgie — von Patient:innen-Apps zur prä-/postoperativen Begleitung bis zu klinischen Entscheidungs-Support-Systemen für Operateur:innen."),
        dict(title="Tumorimmunologie (VTG-Chirurgie UKD Dresden)", thesis_type="experimental",
             description="Experimentelle Doktorarbeit in der chirurgischen Tumorimmunologie. Mehrere Monate Laborzeit erforderlich; geeignet für Studierende mit Interesse an translationaler Onkologie-Forschung."),
        dict(title="Gastrointestinale Tumor- und Stammzellbiologie (VTG-Chirurgie UKD Dresden)", thesis_type="experimental",
             description="Experimentelle Promotion in der Forschung zu gastrointestinalen Tumoren und Stammzellen. Etablierte Methodik (Zellkultur, molekularbiologische Verfahren, ggf. Tiermodelle). Mehrmonatige Laborphase."),
        dict(title="Inselzellforschung und -transplantation (VTG-Chirurgie UKD Dresden)", thesis_type="experimental",
             description="Experimentelle Doktorarbeit zur Pankreas-Inselzellforschung und Transplantationsmedizin. Etablierte Laborgruppe mit klinischer Anbindung an die Transplantationschirurgie."),
        dict(title="Molekulare Marker der Aneurysmaentstehung (VTG-Chirurgie UKD Dresden)", thesis_type="experimental",
             description="Experimentelle Arbeit zu Mechanismen der Aneurysmagenese auf molekularer Ebene. Patientenmaterial vorhanden, Methodik etabliert."),
        dict(title="Minimalinvasive Chirurgie (VTG-Chirurgie UKD Dresden)", thesis_type="clinical",
             description="Klinische Doktorarbeit im Bereich der minimalinvasiven Chirurgie — Outcome-Auswertungen, Methoden-Vergleiche zwischen offenen und laparoskopischen Verfahren, Lernkurven-Analysen."),
    ],
    "psm": [
        dict(title="Angewandte Entwicklungsneurowissenschaften (PSM UKD Dresden)", thesis_type="experimental",
             description="Promotion im Bereich angewandte Entwicklungsneurowissenschaften an der Klinik für Psychosoziale Medizin. Leitung: Prof. Dr. med. Stefan Ehrlich, Ph.D. Sekretariat: Kathrin Görler, Tel. 0351 458-4099."),
        dict(title="Medizinische Psychologie und Soziologie (PSM UKD Dresden)", thesis_type="clinical",
             description="Promotionen in Medizinischer Psychologie und Medizinischer Soziologie. Sekretariat Kathrin Görler. Themen reichen von empirischer Versorgungsforschung bis zu psychometrischen Studien."),
        dict(title="Lehr- und Lernforschung Medizin (PSM UKD Dresden)", thesis_type="statistical",
             description="Doktorarbeit zu medizinischer Lehr- und Lernforschung — Curriculum-Evaluation, Lernergebnisse, didaktische Interventionsstudien."),
    ],
}

# Manuell gepflegt: kanonische Klinikdaten, die nicht aus den AG-Seiten kommen.
CLINICS = {
    "vtg": dict(
        groupName="Klinik und Poliklinik für Viszeral-, Thorax- und Gefäßchirurgie (UKD)",
        specialty="Chirurgie",
        contact="Doktoranden-VTG@uniklinikum-dresden.de",
    ),
    "gyn": dict(
        groupName="Klinik und Poliklinik für Frauenheilkunde und Geburtshilfe (UKD)",
        specialty="Gynäkologie",
        contact="gyn.promotion@uniklinikum-dresden.de",
    ),
    "psy": dict(
        groupName="Klinik und Poliklinik für Psychiatrie und Psychotherapie (UKD)",
        specialty="Psychiatrie",
        contact="kerstin.schlese@tu-dresden.de",
    ),
    "pso": dict(
        groupName="Klinik und Poliklinik für Psychotherapie und Psychosomatik (UKD)",
        specialty="Psychosomatik / Psychotherapie", contact=None,
    ),
    "psm": dict(
        groupName="Klinik und Poliklinik für Psychosoziale Medizin und Entwicklungsneurowissenschaften (UKD)",
        specialty="Entwicklungsneurowissenschaften", contact=None,
    ),
    "oupc": dict(
        groupName="Klinik und Poliklinik für Orthopädie, Unfall- und Plastische Chirurgie (UKD)",
        specialty="Orthopädie / Unfallchirurgie", contact=None,
    ),
    "neurochirurgie": dict(
        groupName="Klinik und Poliklinik für Neurochirurgie (UKD)",
        specialty="Neurochirurgie", contact=None,
    ),
    "mk1": dict(
        groupName="Medizinische Klinik und Poliklinik I (UKD)",
        specialty="Innere Medizin (MK1)", contact=None,
    ),
    "mk3": dict(
        groupName="Medizinische Klinik und Poliklinik III (UKD)",
        specialty="Innere Medizin (MK3)", contact=None,
    ),
    "neurologie": dict(
        groupName="Klinik und Poliklinik für Neurologie (UKD)",
        specialty="Neurologie", contact=None,
    ),
    "hno": dict(
        groupName="Klinik und Poliklinik für Hals-, Nasen- und Ohrenheilkunde (UKD)",
        specialty="HNO", contact=None,
    ),
    "der": dict(
        groupName="Klinik und Poliklinik für Dermatologie (UKD)",
        specialty="Dermatologie", contact=None,
    ),
    "augenheilkunde": dict(
        groupName="Klinik und Poliklinik für Augenheilkunde (UKD)",
        specialty="Ophthalmologie", contact=None,
    ),
    "str": dict(
        groupName="Klinik und Poliklinik für Strahlentherapie und Radioonkologie (UKD)",
        specialty="Strahlentherapie", contact=None,
    ),
    "nuk": dict(
        groupName="Klinik und Poliklinik für Nuklearmedizin (UKD)",
        specialty="Nuklearmedizin", contact=None,
    ),
    "uro": dict(
        groupName="Klinik und Poliklinik für Urologie (UKD)",
        specialty="Urologie", contact=None,
    ),
    "ane": dict(
        groupName="Klinik und Poliklinik für Anästhesiologie und Intensivtherapie (UKD)",
        specialty="Anästhesiologie", contact=None,
    ),
    "kik": dict(
        groupName="Klinik und Poliklinik für Kinder- und Jugendmedizin (UKD)",
        specialty="Pädiatrie", contact=None,
    ),
    "kch": dict(
        groupName="Klinik und Poliklinik für Kinderchirurgie (UKD)",
        specialty="Kinderchirurgie", contact=None,
    ),
    "kjp": dict(
        groupName="Klinik und Poliklinik für Kinder- und Jugendpsychiatrie und -psychotherapie (UKD)",
        specialty="Kinder- und Jugendpsychiatrie", contact=None,
    ),
    "mkg": dict(
        groupName="Klinik und Poliklinik für Mund-, Kiefer- und Gesichtschirurgie (UKD)",
        specialty="MKG-Chirurgie", contact=None,
    ),
    "rad": dict(
        groupName="Institut und Poliklinik für Diagnostische und Interventionelle Radiologie (UKD)",
        specialty="Radiologie", contact=None,
    ),
    "nra": dict(
        groupName="Institut für Neuroradiologie (UKD)",
        specialty="Neuroradiologie", contact=None,
    ),
    "pat": dict(
        groupName="Institut für Pathologie (UKD)",
        specialty="Pathologie", contact=None,
    ),
    "klinchem": dict(
        groupName="Institut für Klinische Chemie und Laboratoriumsmedizin (UKD)",
        specialty="Klinische Chemie", contact=None,
    ),
    "kge": dict(
        groupName="Institut für Klinische Genetik (UKD)",
        specialty="Humangenetik", contact=None,
    ),
    "mikrobio": dict(
        groupName="Institut für Medizinische Mikrobiologie und Virologie (UKD)",
        specialty="Mikrobiologie / Virologie", contact=None,
    ),
    "infekt": dict(
        groupName="Klinische Infektiologie und Krankenhaushygiene (UKD)",
        specialty="Infektiologie", contact=None,
    ),
}

# Slug → Klinik-Root + Public-URL
PUBLIC_URL = {
    "vtg": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/vtg",
    "gyn": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/gyn",
    "psy": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psy",
    "pso": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/pso",
    "psm": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/psm",
    "oupc": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/oupc",
    "neurochirurgie": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurochirurgie",
    "mk1": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk1",
    "mk3": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/mk3",
    "neurologie": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/neurologie",
    "hno": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/hno",
    "der": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/der",
    "augenheilkunde": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/augenheilkunde",
    "str": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/str",
    "nuk": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/nuk",
    "uro": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/uro",
    "ane": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/ane",
    "kik": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/kik",
    "kch": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/kch",
    "kjp": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/kjp",
    "mkg": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/klinik-und-poliklinik-fuer-mund-kiefer-und-gesichtschirurgie",
    "rad": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/rad",
    "nra": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/nra",
    "pat": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/pat",
    "klinchem": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/klinische-chemie-und-laboratoriumsmedizin",
    "kge": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/kge",
    "mikrobio": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/institut-fuer-medizinische-mikrobiologie-und-virologie",
    "infekt": "https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/klinische-infektiologie",
}

# Slug-Mapping zur DB-ID-Vereinheitlichung (Importer-slug bisher mit "ukd-" Prefix)
DB_SLUG_PREFIX = "ukd-"

UNI_ID = "88888888-8888-8888-8888-888888888888"

# Heuristik: Klassifizierung des thesis_type
KEYS_EXPERIMENTAL = ["labor", "molekular", "zellkultur", "biochemisch",
                     "präklinisch", "experimentell", "in vitro", "tiermodell",
                     "tissue", "sequenc", "biopsie", "genomik", "transkripto"]
KEYS_STATISTICAL = ["register", "datenanalyse", "statistik", "epidemiolog",
                    "modellierung", "versorgungsforschung", "kohort"]
KEYS_CLINICAL = ["klinische studie", "patient", "outcome", "behandlung",
                 "therapie", "diagnostik", "klinisch", "studie"]


def infer_thesis_type(body: str) -> str:
    lower = body.lower()
    exp = sum(1 for k in KEYS_EXPERIMENTAL if k in lower)
    sta = sum(1 for k in KEYS_STATISTICAL if k in lower)
    cli = sum(1 for k in KEYS_CLINICAL if k in lower)
    if exp == sta == cli == 0:
        return "other"
    best = max((exp, "experimental"), (sta, "statistical"), (cli, "clinical"))
    return best[1]


def clean_title(t: str, klinik_kuerzel: str) -> str:
    """Normalisiert AG-Titel: entfernt Whitespace, ergänzt Klinik-Kürzel."""
    t = re.sub(r"\s+", " ", t).strip()
    # Standard-Welcome-Titel ersetzen
    if t.lower().startswith(("welcome to", "willkommen")):
        return f"{t[:60]} ({klinik_kuerzel} UKD Dresden)"
    if t.lower() in ("forschung", "lehre", "forschung und lehre",
                     "forschung-research", "forschung & lehre"):
        return f"Forschungsschwerpunkte ({klinik_kuerzel} UKD Dresden)"
    if f"UKD" in t or "Dresden" in t:
        return t
    return f"{t} ({klinik_kuerzel} UKD Dresden)"


def shorten_body(body: str, max_chars: int = 700) -> str:
    """Schneidet body am Satzende vor max_chars."""
    # Bereinige Markdown-Müll
    body = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", body)  # remove images
    body = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", body)  # links → text
    body = re.sub(r"^\s*\*\s*\*\s*\*\s*$", "", body, flags=re.M)  # hrules
    body = re.sub(r"\s+", " ", body).strip()
    if len(body) <= max_chars:
        return body
    cut = body[:max_chars]
    last_period = cut.rfind(". ")
    if last_period > max_chars * 0.5:
        cut = cut[:last_period + 1]
    return cut + " …"


def klinik_kuerzel(slug: str) -> str:
    """Kurzform für den ergänzten Klinik-Hinweis im Titel."""
    return {
        "mk1": "MK1", "mk3": "MK3", "vtg": "VTG-Chirurgie", "gyn": "Frauenklinik",
        "psy": "Psychiatrie", "pso": "Psychotherapie/Psychosomatik",
        "psm": "PSM", "oupc": "OUPC", "neurochirurgie": "Neurochirurgie",
        "neurologie": "Neurologie", "hno": "HNO", "der": "Dermatologie",
        "augenheilkunde": "Augenklinik", "str": "Strahlentherapie",
        "nuk": "Nuklearmedizin", "uro": "Urologie", "ane": "Anästhesie",
        "kik": "Kinderklinik", "kch": "Kinderchirurgie", "kjp": "KJP",
        "mkg": "MKG", "rad": "Radiologie", "nra": "Neuroradiologie",
        "pat": "Pathologie", "klinchem": "Klin. Chemie",
        "kge": "Klin. Genetik", "mikrobio": "Mikrobiologie",
        "infekt": "Infektiologie",
    }.get(slug, slug)


def render_listing(area_title: str, description: str, url: str, thesis_type: str,
                   contact: str | None = None) -> str:
    title_esc = area_title.replace('"', '\\"')
    desc_esc = description.replace('"', '\\"').replace("\\", "\\\\").replace("`", "\\`")
    contact_field = ""
    if contact:
        contact_esc = contact.replace('"', '\\"')
        contact_field = f',\n        applicationContact: "{contact_esc}"'
    return (
        f"      {{ title: \"{title_esc}\", thesis_type: \"{thesis_type}\",\n"
        f"        description: `{desc_esc}\\n\\nQuelle: {url}`{contact_field} }},"
    )


def render_source(slug: str, data: dict) -> str:
    meta = CLINICS[slug]
    public_url = PUBLIC_URL[slug]
    kuerzel = klinik_kuerzel(slug)

    # Manuelle Overrides (höchste Priorität)
    if slug in MANUAL_OVERRIDES:
        items = [
            render_listing(
                o["title"],
                o["description"],
                o.get("url", public_url),  # per-AG URL bevorzugt, fallback Klinik-Root
                o["thesis_type"],
                contact=o.get("contact"),
            )
            for o in MANUAL_OVERRIDES[slug]
        ]
        listings_block = "\n".join(items)
    else:
        pages = data.get("pages", [])
        if not pages:
            # Fallback bei 0 Pages und ohne Override
            listing = render_listing(
                f"Forschungsschwerpunkte ({kuerzel} UKD Dresden)",
                "Diese Klinik betreut Doktorarbeiten in verschiedenen Forschungsbereichen. Konkrete Themen siehe Klinik-Website oder Direktkontakt.",
                public_url,
                "other",
            )
            listings_block = listing
        else:
            items = []
            for p in pages:
                t = clean_title(p["title"], kuerzel)
                b = shorten_body(p["body"])
                ty = infer_thesis_type(p["body"])
                items.append(render_listing(t, b, p["url"], ty))
            listings_block = "\n".join(items)

    contact_line = f'"{meta["contact"]}"' if meta["contact"] else "null"
    return f"""  {{
    slug: "{DB_SLUG_PREFIX}{slug}",
    universityId: TU_DRESDEN_ID,
    groupName: "{meta['groupName']}",
    specialty: "{meta['specialty']}",
    publicUrl: "{public_url}",
    sourceUrl: "{public_url}",
    applicationContact: {contact_line},
    researchAreas: [
{listings_block}
    ],
  }},"""


def main() -> None:
    parts = []
    for slug in sorted(CLINICS.keys()):
        json_file = EXTRACTED / f"{slug}.json"
        data = json.load(open(json_file, encoding="utf-8")) if json_file.exists() else {}
        parts.append(render_source(slug, data))
    print("\n".join(parts))


if __name__ == "__main__":
    main()
