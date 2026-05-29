-- =============================================================
-- AG-Level-Reviews + Person-Named-Flag
--
-- Bisher hingen Reviews ausschließlich an `group_id` (Klinik). Damit
-- konnten Nutzer:innen nur die Klinik bewerten, nicht die spezifische
-- AG. Mit dieser Migration:
--
--   - Reviews können optional an `listing_id` (= AG) geknüpft werden
--   - Listings haben ein `is_person_named`-Flag — für AGs, die nach
--     einer Einzelperson benannt sind ("Schröck Lab", "AG Akgün").
--     Solche Bewertungen sind faktisch Personen-Bewertungen und
--     unterliegen dem Persönlichkeitsrechts-Schutz (höhere Schwelle,
--     hinter NAMED_RATINGS_PUBLIC-Flag in der UI).
--   - Neue View und RPC für Listing-Level-Aggregate
--
-- ⚖️ Die Trennung Topic-AG vs Person-AG sollte vor öffentlichem Launch
-- anwaltlich bestätigt werden — bei sehr kleinen AGs verschwimmt die
-- Personen/Institutions-Grenze.
-- =============================================================

alter table listings
  add column is_person_named boolean not null default false;

alter table reviews
  add column listing_id uuid references listings(id) on delete set null;

create index reviews_listing_id_idx on reviews(listing_id) where listing_id is not null;

-- Unique-Constraint anpassen: gleicher Reviewer darf pro
-- (group_id, listing_id, supervisor_id, thesis_type, year_started)
-- nur EIN Review abgeben.
alter table reviews drop constraint if exists reviews_uniq_per_combination;
alter table reviews add constraint reviews_uniq_per_combination
  unique nulls not distinct
  (reviewer_account_id, group_id, listing_id, supervisor_id, thesis_type, year_started);

-- Aggregat pro Listing
create or replace view listing_review_aggregates as
select
  r.listing_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend
from reviews r
where r.listing_id is not null
group by r.listing_id;

create or replace function public.get_listing_aggregate(p_listing_id uuid)
returns table (
  review_count bigint,
  avg_supervision_quality numeric,
  avg_responsiveness numeric,
  avg_timeline_realism numeric,
  avg_project_delivered numeric,
  avg_would_recommend numeric
)
language sql
security definer
set search_path = public
as $$
  select
    review_count,
    avg_supervision_quality,
    avg_responsiveness,
    avg_timeline_realism,
    avg_project_delivered,
    avg_would_recommend
  from listing_review_aggregates
  where listing_id = p_listing_id;
$$;

grant execute on function public.get_listing_aggregate(uuid) to anon, authenticated;
