-- =============================================================
-- Row Level Security
-- =============================================================
-- Default: alles dicht. Lese-Policies öffnen explizit nur das,
-- was öffentlich sein darf (veröffentlichte Listings, Stammdaten,
-- Aggregate). Schreib-Policies fordern eingeloggten User mit
-- passendem reviewer_account.
-- =============================================================

alter table universities enable row level security;
alter table groups enable row level security;
alter table supervisors enable row level security;
alter table listings enable row level security;
alter table reviewer_accounts enable row level security;
alter table reviews enable row level security;
alter table complaints enable row level security;
alter table monetization_surfaces enable row level security;

-- ---------- Stammdaten: öffentlich lesbar ----------
create policy "universities_public_read" on universities
  for select using (true);

create policy "groups_public_read" on groups
  for select using (true);

create policy "supervisors_public_read" on supervisors
  for select using (takedown_state = 'live');

-- ---------- Listings: nur 'published' öffentlich ----------
create policy "listings_public_read" on listings
  for select using (status = 'published');

-- Einreichungen: anonym oder eingeloggt — erzeugt Pending-Listing
create policy "listings_public_insert_pending" on listings
  for insert
  with check (status = 'pending' and source = 'submitted' and promoted = false);

-- ---------- Reviewer-Konten: Eigentümer/in lesen/aktualisieren ----------
create policy "reviewer_accounts_own_read" on reviewer_accounts
  for select using (user_id = auth.uid());

create policy "reviewer_accounts_own_insert" on reviewer_accounts
  for insert with check (user_id = auth.uid());

create policy "reviewer_accounts_own_update" on reviewer_accounts
  for update using (user_id = auth.uid());

-- ---------- Reviews ----------
-- Lesen: Eigentümer/in sieht eigene; öffentliche Aggregate laufen über
-- security-definer-Funktionen, nicht über direktes select auf reviews.
create policy "reviews_own_read" on reviews
  for select using (
    reviewer_account_id in (
      select id from reviewer_accounts where user_id = auth.uid()
    )
  );

-- Schreiben: nur eigener Reviewer-Account, Status muss 'pending' starten
create policy "reviews_own_insert" on reviews
  for insert with check (
    status = 'pending'
    and reviewer_account_id in (
      select id from reviewer_accounts
      where user_id = auth.uid() and identity_verified = true
    )
  );

-- Update: Eigentümer/in darf Freitext bearbeiten, solange noch pending
create policy "reviews_own_update_pending" on reviews
  for update using (
    status = 'pending'
    and reviewer_account_id in (
      select id from reviewer_accounts where user_id = auth.uid()
    )
  );

-- ---------- Beschwerden: jeder darf einreichen, niemand öffentlich lesen ----------
create policy "complaints_public_insert" on complaints
  for insert with check (true);

-- Monetarisierung: gar kein öffentlicher Zugriff (admin nur via Service Role)
-- (keine Policies → alles dicht)

-- =============================================================
-- Öffentliche Aggregat-Funktionen (security definer)
-- =============================================================
-- Liefern Aggregate, ohne dass anon direkten select-Zugriff auf
-- die `reviews`-Tabelle bekommt.
-- Schwellenwert-Logik (§4) wird in der App-Schicht durchgesetzt;
-- diese Funktionen liefern auch unter-Schwellen-Zahlen, damit die
-- App entscheiden kann "nicht genug Bewertungen" anzuzeigen.
-- =============================================================

create or replace function public.get_group_aggregate(p_group_id uuid)
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
  from group_review_aggregates
  where group_id = p_group_id;
$$;

create or replace function public.get_supervisor_aggregate(p_supervisor_id uuid)
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
  from supervisor_review_aggregates
  where supervisor_id = p_supervisor_id;
$$;

grant execute on function public.get_group_aggregate(uuid) to anon, authenticated;
grant execute on function public.get_supervisor_aggregate(uuid) to anon, authenticated;
