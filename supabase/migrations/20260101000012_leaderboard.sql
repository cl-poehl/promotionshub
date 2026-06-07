-- =============================================================
-- Bestenliste: Top-Gruppen (Kliniken) und Top-AGs nach Bewertung.
--
-- Sortierung: Gesamtschnitt der fünf Dimensionen, Tie-Break über
-- Anzahl der Berichte. Schwellenwert kommt als Parameter aus der
-- App-Schicht (MIN_REVIEWS_FOR_GROUP_SCORE), damit er konfigurierbar
-- bleibt. Personen-benannte AGs werden mitgeliefert und in der
-- App-Schicht nach NAMED_RATINGS_PUBLIC + erhöhter Schwelle gefiltert.
-- =============================================================

create or replace function public.get_top_groups(
  p_min_reviews int default 2,
  p_limit int default 10
)
returns table (
  group_id uuid,
  name text,
  specialty text,
  review_count bigint,
  verified_student_count bigint,
  overall numeric
)
language sql
security definer
set search_path = public
as $$
  select
    a.group_id,
    g.name,
    g.specialty,
    a.review_count,
    a.verified_student_count,
    round(
      (
        coalesce(a.avg_supervision_quality, 0)
        + coalesce(a.avg_responsiveness, 0)
        + coalesce(a.avg_timeline_realism, 0)
        + coalesce(a.avg_project_delivered, 0)
        + coalesce(a.avg_would_recommend, 0)
      ) / 5,
      2
    ) as overall
  from group_review_aggregates a
  join groups g on g.id = a.group_id
  where a.review_count >= p_min_reviews
  order by overall desc, a.review_count desc
  limit p_limit;
$$;

create or replace function public.get_top_listings(
  p_min_reviews int default 2,
  p_limit int default 10
)
returns table (
  listing_id uuid,
  title text,
  group_name text,
  is_person_named boolean,
  review_count bigint,
  verified_student_count bigint,
  overall numeric
)
language sql
security definer
set search_path = public
as $$
  select
    a.listing_id,
    l.title,
    g.name as group_name,
    l.is_person_named,
    a.review_count,
    a.verified_student_count,
    round(
      (
        coalesce(a.avg_supervision_quality, 0)
        + coalesce(a.avg_responsiveness, 0)
        + coalesce(a.avg_timeline_realism, 0)
        + coalesce(a.avg_project_delivered, 0)
        + coalesce(a.avg_would_recommend, 0)
      ) / 5,
      2
    ) as overall
  from listing_review_aggregates a
  join listings l on l.id = a.listing_id
  join groups g on g.id = l.group_id
  where a.review_count >= p_min_reviews
    and l.status = 'published'
  order by overall desc, a.review_count desc
  limit p_limit;
$$;

grant execute on function public.get_top_groups(int, int) to anon, authenticated;
grant execute on function public.get_top_listings(int, int) to anon, authenticated;
