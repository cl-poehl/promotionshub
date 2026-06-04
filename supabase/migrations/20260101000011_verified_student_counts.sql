-- =============================================================
-- Verifizierte-Studierende-Anteil in den Review-Aggregaten.
--
-- Kontext: Registrierung mit persönlichen Adressen (Gmail etc.)
-- bleibt erlaubt — das ist der Alumni-Weg. Statt zu blockieren,
-- machen wir den Unterschied sichtbar: Aggregate weisen aus, wie
-- viele der Berichte von erkannten Universitäts-Adressen stammen
-- (reviewer_accounts.student_signal = 'verified_student').
--
-- Views + RPCs müssen neu erstellt werden (drop + create), weil
-- `create or replace` weder View-Spaltenreihenfolge noch
-- Funktions-Rückgabetypen ändern darf.
-- =============================================================

-- ---------- Views ----------

drop view if exists group_review_aggregates;
create view group_review_aggregates as
select
  r.group_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend,
  count(*) filter (
    where r.status = 'published' and ra.student_signal = 'verified_student'
  ) as verified_student_count
from reviews r
join reviewer_accounts ra on ra.id = r.reviewer_account_id
group by r.group_id;

drop view if exists supervisor_review_aggregates;
create view supervisor_review_aggregates as
select
  r.supervisor_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend,
  count(*) filter (
    where r.status = 'published' and ra.student_signal = 'verified_student'
  ) as verified_student_count
from reviews r
join reviewer_accounts ra on ra.id = r.reviewer_account_id
where r.supervisor_id is not null
group by r.supervisor_id;

drop view if exists listing_review_aggregates;
create view listing_review_aggregates as
select
  r.listing_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend,
  count(*) filter (
    where r.status = 'published' and ra.student_signal = 'verified_student'
  ) as verified_student_count
from reviews r
join reviewer_accounts ra on ra.id = r.reviewer_account_id
where r.listing_id is not null
group by r.listing_id;

-- ---------- RPCs ----------

drop function if exists public.get_group_aggregate(uuid);
create function public.get_group_aggregate(p_group_id uuid)
returns table (
  review_count bigint,
  avg_supervision_quality numeric,
  avg_responsiveness numeric,
  avg_timeline_realism numeric,
  avg_project_delivered numeric,
  avg_would_recommend numeric,
  verified_student_count bigint
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
    avg_would_recommend,
    verified_student_count
  from group_review_aggregates
  where group_id = p_group_id;
$$;

drop function if exists public.get_supervisor_aggregate(uuid);
create function public.get_supervisor_aggregate(p_supervisor_id uuid)
returns table (
  review_count bigint,
  avg_supervision_quality numeric,
  avg_responsiveness numeric,
  avg_timeline_realism numeric,
  avg_project_delivered numeric,
  avg_would_recommend numeric,
  verified_student_count bigint
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
    avg_would_recommend,
    verified_student_count
  from supervisor_review_aggregates
  where supervisor_id = p_supervisor_id;
$$;

drop function if exists public.get_listing_aggregate(uuid);
create function public.get_listing_aggregate(p_listing_id uuid)
returns table (
  review_count bigint,
  avg_supervision_quality numeric,
  avg_responsiveness numeric,
  avg_timeline_realism numeric,
  avg_project_delivered numeric,
  avg_would_recommend numeric,
  verified_student_count bigint
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
    avg_would_recommend,
    verified_student_count
  from listing_review_aggregates
  where listing_id = p_listing_id;
$$;

grant execute on function public.get_group_aggregate(uuid) to anon, authenticated;
grant execute on function public.get_supervisor_aggregate(uuid) to anon, authenticated;
grant execute on function public.get_listing_aggregate(uuid) to anon, authenticated;
