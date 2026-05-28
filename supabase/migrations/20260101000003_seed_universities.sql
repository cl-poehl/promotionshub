-- =============================================================
-- Seed-Daten: echte medizinische Fakultäten und Beispiel-Gruppen.
-- Diese Migration läuft auf Produktion UND auf Preview-Branches.
-- Beispiel-LISTINGS (mit fiktiven Kontakten) liegen in
-- ../seed.sql und laufen nur auf Preview-Branches.
-- =============================================================

insert into universities (id, name, city, state) values
  ('11111111-1111-1111-1111-111111111111', 'Charité – Universitätsmedizin Berlin', 'Berlin', 'Berlin'),
  ('22222222-2222-2222-2222-222222222222', 'Ludwig-Maximilians-Universität München', 'München', 'Bayern'),
  ('33333333-3333-3333-3333-333333333333', 'Universität Heidelberg', 'Heidelberg', 'Baden-Württemberg'),
  ('44444444-4444-4444-4444-444444444444', 'Medizinische Hochschule Hannover', 'Hannover', 'Niedersachsen'),
  ('55555555-5555-5555-5555-555555555555', 'Universität Hamburg / UKE', 'Hamburg', 'Hamburg'),
  ('66666666-6666-6666-6666-666666666666', 'Universität zu Köln', 'Köln', 'Nordrhein-Westfalen'),
  ('77777777-7777-7777-7777-777777777777', 'Technische Universität München', 'München', 'Bayern'),
  ('88888888-8888-8888-8888-888888888888', 'Technische Universität Dresden', 'Dresden', 'Sachsen')
on conflict do nothing;

-- Beispiel-Gruppen: real existierende Strukturen, dienen als
-- Startpunkt. Erweiterung idealerweise über die Listing-Einreichung,
-- die bei Bedarf neue Gruppen anlegt.
insert into groups (id, university_id, name, specialty, public_url) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'AG Kardiovaskuläre Forschung', 'Kardiologie', 'https://www.charite.de'),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Institut für Medizinische Immunologie', 'Immunologie', 'https://www.charite.de'),
  ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'Klinik für Neurologie – AG Schlaganfallforschung', 'Neurologie', 'https://www.lmu.de'),
  ('a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
   'Nationales Centrum für Tumorerkrankungen (NCT)', 'Onkologie', 'https://www.nct-heidelberg.de'),
  ('a0000000-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444',
   'Institut für Transplantationsforschung', 'Transplantation', 'https://www.mh-hannover.de'),
  ('a0000000-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555555',
   'Zentrum für Psychosoziale Medizin', 'Psychiatrie', 'https://www.uke.de'),
  ('a0000000-0000-0000-0000-000000000007', '66666666-6666-6666-6666-666666666666',
   'Klinik für Allgemein-, Viszeral- und Tumorchirurgie', 'Chirurgie', 'https://www.uk-koeln.de')
on conflict do nothing;
