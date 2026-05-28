-- =============================================================
-- Duplikate verhindern, wenn supervisor_id NULL ist.
--
-- Der ursprüngliche UNIQUE-Constraint
--   unique (reviewer_account_id, group_id, supervisor_id, thesis_type, year_started)
-- erlaubt Duplikate, sobald supervisor_id NULL ist, weil Postgres
-- per Default NULL ≠ NULL bei Uniqueness behandelt.
--
-- Fix mit NULLS NOT DISTINCT (Postgres 15+).
--
-- Vor dem Anlegen des neuen Constraints werden vorhandene Duplikate
-- bereinigt — der älteste Eintrag pro Kombination bleibt erhalten.
-- =============================================================

-- 1) Duplikate dedupen: alle bis auf die früheste Zeile löschen.
delete from reviews r
using reviews older
where r.id <> older.id
  and r.reviewer_account_id = older.reviewer_account_id
  and r.group_id = older.group_id
  and r.thesis_type = older.thesis_type
  and r.year_started = older.year_started
  and r.supervisor_id is not distinct from older.supervisor_id
  and r.created_at > older.created_at;

-- 2) Alten Constraint entfernen.
alter table reviews drop constraint if exists
  reviews_reviewer_account_id_group_id_supervisor_id_thesis_t_key;

-- 3) Neuen Constraint mit NULLS NOT DISTINCT setzen.
alter table reviews add constraint reviews_uniq_per_combination
  unique nulls not distinct
  (reviewer_account_id, group_id, supervisor_id, thesis_type, year_started);
