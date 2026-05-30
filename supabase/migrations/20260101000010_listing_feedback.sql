-- =============================================================
-- Listing-Feedback — Korrektur-/Hinweis-Kanal pro Stellenanzeige
--
-- Ergänzt das §7-Beschwerdeverfahren (`complaints` für Review-Takedown)
-- um einen niedrigschwelligen Feedback-Kanal: Nutzer:innen können
-- ohne Login melden, wenn an einem Listing etwas nicht stimmt
-- (Kontakt veraltet, Forschungsschwerpunkt falsch, Stelle existiert
-- nicht mehr usw.).
-- =============================================================

create type listing_feedback_type as enum (
  'no_longer_exists',
  'wrong_research_focus',
  'wrong_thesis_type',
  'wrong_contact',
  'outdated',
  'other'
);

create type listing_feedback_state as enum (
  'received',
  'reviewed',
  'applied',
  'rejected'
);

create table listing_feedback (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  type listing_feedback_type not null,
  description text not null check (char_length(description) between 5 and 2000),
  -- Optionaler Kontakt für Rückfragen (E-Mail-Adresse oder leer).
  reporter_email text check (
    reporter_email is null
    or char_length(reporter_email) between 5 and 200
  ),
  state listing_feedback_state not null default 'received',
  received_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_notes text
);

create index listing_feedback_listing_idx on listing_feedback(listing_id);
create index listing_feedback_state_idx on listing_feedback(state);

-- RLS: anonym darf einfügen (Feedback ist absichtlich barrierearm),
-- niemand außer Service-Role darf lesen.
alter table listing_feedback enable row level security;

create policy "listing_feedback_public_insert" on listing_feedback
  for insert with check (true);
