-- =============================================================
-- Erfahrungsberichte um strukturierte Felder erweitern
--
-- Bisher: 5 Likert-Dimensionen + ein einziger Freitext.
-- Neu: zusätzliche kategorische Felder, die genau das erfassen,
-- was angehende Doktorand:innen vor einer Bewerbung wissen wollen.
-- =============================================================

create type promotion_status as enum ('ongoing', 'completed', 'discontinued');
create type weekly_hours_band as enum ('fulltime', 'parttime_high', 'parttime_low', 'occasional');
create type publication_outcome as enum ('first_author', 'coauthor', 'mentioned', 'none', 'in_progress');
create type funding_as_promised as enum ('yes', 'partial', 'no', 'na');

alter table reviews
  add column promotion_status promotion_status,
  add column weekly_hours weekly_hours_band,
  add column publication_outcome publication_outcome,
  add column funding_as_promised funding_as_promised,
  add column what_went_well text,
  add column what_went_hard text,
  add column tip_for_successors text;

-- Längen-Limits (defensiv, parallel zur Frontend-Validierung)
alter table reviews
  add constraint reviews_what_went_well_len check (char_length(coalesce(what_went_well, '')) <= 1500),
  add constraint reviews_what_went_hard_len check (char_length(coalesce(what_went_hard, '')) <= 1500),
  add constraint reviews_tip_len check (char_length(coalesce(tip_for_successors, '')) <= 1500);
