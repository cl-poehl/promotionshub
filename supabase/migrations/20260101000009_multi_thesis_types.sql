-- =============================================================
-- Listings können mehrere Thesis-Typen anbieten
--
-- Bisher hatten Listings eine `thesis_type`-Spalte. In der Realität
-- bieten die meisten AGs alle drei Typen (klinisch, experimentell,
-- statistisch) an — der Doktorand:in handelt das mit der/dem
-- Betreuer:in aus.
--
-- Neue Spalte `thesis_types_offered` als Array. Die alte Spalte
-- `thesis_type` bleibt als „primärer" / „häufigster" Typ. Der Filter
-- in der Suche prüft das Array (Array-Überlapp), die Anzeige listet
-- alle Typen.
-- =============================================================

alter table listings
  add column thesis_types_offered thesis_type[] not null default '{}';

-- Migrate existing data: copy primary into array
update listings
  set thesis_types_offered = array[thesis_type]::thesis_type[]
  where array_length(thesis_types_offered, 1) is null;

-- GIN-Index für schnellen Array-Überlapp-Filter
create index listings_thesis_types_offered_idx on listings using gin(thesis_types_offered);

-- Default entfernen — explizite Setzung per Importer
alter table listings alter column thesis_types_offered drop default;
