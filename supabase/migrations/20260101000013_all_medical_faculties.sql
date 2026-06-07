-- =============================================================
-- Alle deutschen Universitäten mit medizinischer Fakultät
-- (Promotionsrecht Dr. med. / Dr. med. dent.).
--
-- Für das Einreichen-Formular: Stellen können aus ganz Deutschland
-- eingereicht werden, auch wenn der kuratierte Bestand vorerst
-- Dresden ist. unique(name, city) + on conflict macht die Migration
-- idempotent gegenüber den 8 bestehenden Seed-Einträgen.
-- =============================================================

insert into universities (name, city, state) values
  ('RWTH Aachen', 'Aachen', 'Nordrhein-Westfalen'),
  ('Universität Augsburg', 'Augsburg', 'Bayern'),
  ('Universität Bielefeld', 'Bielefeld', 'Nordrhein-Westfalen'),
  ('Ruhr-Universität Bochum', 'Bochum', 'Nordrhein-Westfalen'),
  ('Universität Bonn', 'Bonn', 'Nordrhein-Westfalen'),
  ('Heinrich-Heine-Universität Düsseldorf', 'Düsseldorf', 'Nordrhein-Westfalen'),
  ('Universität Duisburg-Essen', 'Essen', 'Nordrhein-Westfalen'),
  ('Friedrich-Alexander-Universität Erlangen-Nürnberg', 'Erlangen', 'Bayern'),
  ('Goethe-Universität Frankfurt', 'Frankfurt am Main', 'Hessen'),
  ('Universität Freiburg', 'Freiburg', 'Baden-Württemberg'),
  ('Justus-Liebig-Universität Gießen', 'Gießen', 'Hessen'),
  ('Universität Göttingen', 'Göttingen', 'Niedersachsen'),
  ('Universität Greifswald', 'Greifswald', 'Mecklenburg-Vorpommern'),
  ('Martin-Luther-Universität Halle-Wittenberg', 'Halle (Saale)', 'Sachsen-Anhalt'),
  ('Medizinische Fakultät Mannheim (Universität Heidelberg)', 'Mannheim', 'Baden-Württemberg'),
  ('Universität des Saarlandes', 'Homburg', 'Saarland'),
  ('Friedrich-Schiller-Universität Jena', 'Jena', 'Thüringen'),
  ('Christian-Albrechts-Universität zu Kiel', 'Kiel', 'Schleswig-Holstein'),
  ('Universität Leipzig', 'Leipzig', 'Sachsen'),
  ('Universität zu Lübeck', 'Lübeck', 'Schleswig-Holstein'),
  ('Otto-von-Guericke-Universität Magdeburg', 'Magdeburg', 'Sachsen-Anhalt'),
  ('Johannes Gutenberg-Universität Mainz', 'Mainz', 'Rheinland-Pfalz'),
  ('Philipps-Universität Marburg', 'Marburg', 'Hessen'),
  ('Universität Münster', 'Münster', 'Nordrhein-Westfalen'),
  ('Carl von Ossietzky Universität Oldenburg', 'Oldenburg', 'Niedersachsen'),
  ('Universität Regensburg', 'Regensburg', 'Bayern'),
  ('Universität Rostock', 'Rostock', 'Mecklenburg-Vorpommern'),
  ('Eberhard Karls Universität Tübingen', 'Tübingen', 'Baden-Württemberg'),
  ('Universität Ulm', 'Ulm', 'Baden-Württemberg'),
  ('Julius-Maximilians-Universität Würzburg', 'Würzburg', 'Bayern'),
  ('Universität Witten/Herdecke', 'Witten', 'Nordrhein-Westfalen'),
  ('Medizinische Hochschule Brandenburg Theodor Fontane', 'Neuruppin', 'Brandenburg')
on conflict (name, city) do nothing;
