-- =============================================================
-- Preview-Branch-Seed.
-- Diese Datei läuft NUR auf Preview-Branches, niemals in
-- Produktion (siehe Supabase-Branching-Dokumentation).
-- Enthält fiktive Beispiel-Listings mit ausgedachten Kontakten,
-- damit Pull-Request-Previews realistische UI-Daten zeigen.
-- Echte Universitäten/Gruppen liegen in der Migration
-- 20260101000003_seed_universities.sql.
-- =============================================================

insert into listings
  (id, group_id, title, description, thesis_type, funding, expected_duration_months, source, application_contact, status, posted_at)
values
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Rolle von SGLT2-Inhibitoren bei diastolischer Herzinsuffizienz',
    'Experimentelle Doktorarbeit mit Maus-Modellen. Etablierte Methodik (Echokardiographie, Histologie). Erfahrung mit Tierversuchen wünschenswert, aber nicht erforderlich. TVT-Modul wird gestellt.',
    'experimental', 'stipend', 18, 'submitted', 'doktorarbeiten@charite-beispiel.de', 'published', now() - interval '3 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'T-Zell-Antworten nach mRNA-Impfung bei immunsupprimierten Patient:innen',
    'Klinisch-experimentelle Arbeit. Patient:innenrekrutierung läuft, Probenbank vorhanden. Geeignet ab 6. Semester. Mind. 12 Monate Vollzeit-Phase erforderlich.',
    'experimental', 'paid', 24, 'submitted', 'immunologie@charite-beispiel.de', 'published', now() - interval '10 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'Retrospektive Analyse: Thrombolyse-Outcomes 2018–2024',
    'Statistische Doktorarbeit. Datensatz vollständig vorhanden, Auswertung mit R/SPSS. Sehr gut neben dem Studium machbar. Statistik-Kurs wird intern angeboten.',
    'statistical', 'unpaid', 12, 'submitted', 'neuro-promotion@klinikum-beispiel.de', 'published', now() - interval '1 day'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    'Single-Cell-Sequencing bei kolorektalen Karzinomen',
    'Anspruchsvolles experimentelles Projekt. Idealerweise 18–24 Monate Vollzeit. Mentoring durch PostDoc, wöchentliche Lab-Meetings. Publikation als Erstautor:in realistisch.',
    'experimental', 'stipend', 24, 'submitted', 'nct-doktoranden@nct-beispiel.de', 'published', now() - interval '6 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    'Langzeit-Outcomes nach Lebertransplantation – Register-Auswertung',
    'Klinische Doktorarbeit auf Basis des deutschen Transplantationsregisters. Strukturiert, klare Fragestellung, regelmäßige Treffen.',
    'clinical', 'unpaid', 12, 'submitted', 'transplant@mhh-beispiel.de', 'published', now() - interval '15 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000006',
    'Psychosoziale Belastung von Angehörigen Demenzkranker',
    'Mixed-Methods-Arbeit. Interviews + Fragebogen. Datenerhebung ca. 6 Monate.',
    'clinical', 'unpaid', 18, 'submitted', 'psyche-doktorarbeit@uke-beispiel.de', 'published', now() - interval '2 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000007',
    'Postoperative Komplikationen nach Pankreasresektion – Risikomodell',
    'Statistische Arbeit, Modellentwicklung. Daten aus Klinikregister, Auswertung mit Python. Vorkenntnisse hilfreich, aber nicht zwingend.',
    'statistical', 'unpaid', 12, 'submitted', 'chirurgie-doktorarbeit@uk-koeln-beispiel.de', 'published', now() - interval '20 days'
  )
on conflict do nothing;
