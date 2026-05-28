-- =============================================================
-- PromotionsHub — Schema (Phase 1 + Phase 2 + Phase 3 vorbereitet)
-- =============================================================
-- Entspricht §3 der Spezifikation. Architektur-Prinzip (§2):
-- Listings und Ratings sind strukturell getrennt; Bezahlung
-- darf nur Listing-Ranking beeinflussen, nie Bewertungsdarstellung.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Enum-Typen ----------
create type thesis_type as enum ('experimental', 'clinical', 'statistical', 'other');
create type funding_type as enum ('paid', 'stipend', 'unpaid', 'unknown');
create type listing_source as enum ('scraped', 'submitted', 'claimed');
create type listing_status as enum ('pending', 'published', 'archived', 'removed');

create type reviewer_email_type as enum ('university', 'personal');
create type student_signal as enum ('verified_student', 'accountable_only');
create type verification_tier as enum ('email', 'documentary', 'founder_vouched');

create type review_status as enum ('pending', 'published', 'under_review', 'removed');
create type free_text_status as enum (
  'none',
  'pending_moderation',
  'published',
  'flagged_factual',
  'rejected'
);

create type complaint_type as enum ('factual_dispute', 'insult', 'other');
create type complaint_state as enum (
  'received',
  'forwarded_to_reviewer',
  'awaiting_substantiation',
  'resolved_kept',
  'resolved_removed'
);

create type takedown_state as enum ('live', 'under_review', 'removed');
create type monetization_kind as enum (
  'listing_promotion',
  'recruiting_ad',
  'lead_gen',
  'student_premium'
);

-- ---------- Stammdaten ----------
create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  created_at timestamptz not null default now(),
  unique (name, city)
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete restrict,
  name text not null,
  specialty text,
  public_url text,
  created_at timestamptz not null default now(),
  unique (university_id, name)
);

create table supervisors (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete restrict,
  name text not null,
  title text,
  role text,
  public_profile_url text,
  listing_status text not null default 'active'
    check (listing_status in ('active', 'inactive')),
  takedown_state takedown_state not null default 'live',
  created_at timestamptz not null default now()
);

create index supervisors_group_id_idx on supervisors(group_id);

-- ---------- Listings (Phase 1 Kern) ----------
create table listings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete restrict,
  supervisor_id uuid references supervisors(id) on delete set null,
  title text not null,
  description text not null,
  thesis_type thesis_type not null,
  funding funding_type not null default 'unknown',
  expected_duration_months int,
  posted_at timestamptz not null default now(),
  source listing_source not null,
  application_contact text,
  -- promoted/promotion_expires_at: Phase 3. Affects nur Listing-Ranking, nie Ratings.
  promoted boolean not null default false,
  promotion_expires_at timestamptz,
  status listing_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index listings_group_id_idx on listings(group_id);
create index listings_status_posted_idx on listings(status, posted_at desc);
create index listings_thesis_type_idx on listings(thesis_type);

-- ---------- Reviewer-Konten ----------
-- Jede/r Bewertende muss eine verifizierte Email haben (§6). Die
-- ReviewerAccount-Zeile wird beim ersten Login erzeugt und über
-- user_id (Supabase auth.users) verknüpft.
create table reviewer_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  email_type reviewer_email_type not null,
  university_id uuid references universities(id) on delete set null,
  identity_verified boolean not null default false,
  student_signal student_signal not null,
  verification_tier verification_tier not null default 'email',
  created_at timestamptz not null default now()
);

-- ---------- Bewertungen ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_account_id uuid not null references reviewer_accounts(id) on delete cascade,
  group_id uuid not null references groups(id) on delete restrict,
  supervisor_id uuid references supervisors(id) on delete set null,
  thesis_type thesis_type not null,
  year_started int not null,
  year_ended int,

  -- Likert 1..5
  supervision_quality int not null check (supervision_quality between 1 and 5),
  responsiveness int not null check (responsiveness between 1 and 5),
  timeline_realism int not null check (timeline_realism between 1 and 5),
  project_delivered int not null check (project_delivered between 1 and 5),
  would_recommend int not null check (would_recommend between 1 and 5),

  free_text text,
  free_text_status free_text_status not null default 'none',

  status review_status not null default 'pending',
  created_at timestamptz not null default now(),

  -- ein Reviewer pro (Gruppe, Betreuer, thesis_type, year_started)-Kombination
  unique (reviewer_account_id, group_id, supervisor_id, thesis_type, year_started)
);

create index reviews_group_id_idx on reviews(group_id);
create index reviews_supervisor_id_idx on reviews(supervisor_id);
create index reviews_status_idx on reviews(status);

-- ---------- Notice-and-Takedown ----------
create table complaints (
  id uuid primary key default gen_random_uuid(),
  target_review_id uuid not null references reviews(id) on delete cascade,
  complainant_contact text not null,
  claim_text text not null,
  type complaint_type not null,
  state complaint_state not null default 'received',
  received_at timestamptz not null default now(),
  forwarded_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text
);

create index complaints_state_idx on complaints(state);
create index complaints_target_idx on complaints(target_review_id);

-- ---------- Monetarisierungs-Oberflächen (Phase 3, inaktiv) ----------
create table monetization_surfaces (
  id uuid primary key default gen_random_uuid(),
  kind monetization_kind not null,
  active boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Aggregat-Sicht: Gruppe.
-- Liefert die strukturierten Score-Mittelwerte und Verteilung,
-- aber NUR ab Schwellenwert (Filter geschieht in der App-Schicht,
-- da der Schwellenwert konfigurierbar ist).
-- =============================================================
create view group_review_aggregates as
select
  r.group_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend
from reviews r
group by r.group_id;

create view supervisor_review_aggregates as
select
  r.supervisor_id,
  count(*) filter (where r.status = 'published') as review_count,
  round(avg(r.supervision_quality) filter (where r.status = 'published')::numeric, 2) as avg_supervision_quality,
  round(avg(r.responsiveness) filter (where r.status = 'published')::numeric, 2) as avg_responsiveness,
  round(avg(r.timeline_realism) filter (where r.status = 'published')::numeric, 2) as avg_timeline_realism,
  round(avg(r.project_delivered) filter (where r.status = 'published')::numeric, 2) as avg_project_delivered,
  round(avg(r.would_recommend) filter (where r.status = 'published')::numeric, 2) as avg_would_recommend
from reviews r
where r.supervisor_id is not null
group by r.supervisor_id;
