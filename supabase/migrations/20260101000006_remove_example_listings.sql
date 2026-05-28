-- =============================================================
-- Räumt sämtliche Bootstrap-/Test-Daten aus der Produktions-DB.
--
-- Echte Daten kommen ab jetzt aus:
--   - dem TU-Dresden-Importer (`npm run import:tu-dresden`)
--   - öffentlichen Einreichungen über das Formular
--   - echten Erfahrungsberichten authentifizierter Nutzer:innen
--
-- Reihenfolge wegen Foreign Keys:
--   1. Reviews zu Beispiel-Gruppen löschen (test-review)
--   2. Listings zu Beispiel-Gruppen löschen (b0000000-...)
--   3. Beispiel-Gruppen selbst löschen (a0000000-...)
-- =============================================================

-- 1) Test-Review(s) auf Beispiel-Gruppen entfernen.
delete from reviews
where group_id between 'a0000000-0000-0000-0000-000000000001'
                  and 'a0000000-0000-0000-0000-000000000099';

-- 2) Beispiel-Listings entfernen.
delete from listings
where id between 'b0000000-0000-0000-0000-000000000001'
            and 'b0000000-0000-0000-0000-000000000099';

-- 3) Beispiel-Gruppen entfernen.
delete from groups
where id between 'a0000000-0000-0000-0000-000000000001'
            and 'a0000000-0000-0000-0000-000000000099';
