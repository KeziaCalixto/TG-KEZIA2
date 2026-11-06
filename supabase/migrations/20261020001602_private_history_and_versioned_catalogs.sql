-- This schema is a first academic slice, not a legally reviewed catalog.
create table public.legal_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 300),
  url text not null check (url ~ '^https://'),
  provision text not null,
  consulted_at timestamptz not null,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.legal_rule_versions (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  version text not null,
  source_id uuid not null references public.legal_sources(id) on delete restrict,
  scope jsonb not null check (jsonb_typeof(scope) = 'object'),
  valid_from date not null,
  valid_until date,
  definition jsonb not null check (jsonb_typeof(definition) = 'object'),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique(rule_key, version),
  check (valid_until is null or valid_until >= valid_from)
);
create index legal_rule_versions_source_idx on public.legal_rule_versions(source_id);

create table public.calendar_versions (
  id uuid primary key default gen_random_uuid(),
  calendar_key text not null,
  version text not null,
  court text not null,
  locality text not null,
  coverage_start date not null,
  coverage_end date not null,
  is_complete boolean not null default false,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now(),
  unique(calendar_key, version),
  check (coverage_end >= coverage_start),
  check (review_status <> 'approved' or is_complete)
);

create table public.deadline_calculations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Cálculo demonstrativo' check (length(title) between 1 and 120),
  input jsonb not null check (jsonb_typeof(input) = 'object'),
  result_snapshot jsonb not null check (jsonb_typeof(result_snapshot) = 'object'),
  -- No reviewed/approved result can be claimed by this academic slice.
  status text not null default 'provisional' check (status = 'provisional'),
  created_at timestamptz not null default now(),
  check (octet_length(input::text) <= 32768),
  check (octet_length(result_snapshot::text) <= 1048576)
);
create index deadline_calculations_owner_created_idx on public.deadline_calculations(owner_id, created_at desc);

alter table public.legal_sources enable row level security;
alter table public.legal_rule_versions enable row level security;
alter table public.calendar_versions enable row level security;
alter table public.deadline_calculations enable row level security;

revoke all on public.legal_sources, public.legal_rule_versions, public.calendar_versions, public.deadline_calculations from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.legal_sources, public.legal_rule_versions, public.calendar_versions to anon, authenticated;
grant select, insert, delete on public.deadline_calculations to authenticated;

create policy approved_sources_read on public.legal_sources for select to anon, authenticated
  using (review_status = 'approved');
create policy approved_rules_read on public.legal_rule_versions for select to anon, authenticated
  using (review_status = 'approved' and exists (
    select 1 from public.legal_sources s where s.id = source_id and s.review_status = 'approved'
  ));
create policy approved_calendars_read on public.calendar_versions for select to anon, authenticated
  using (review_status = 'approved' and is_complete);

create policy owner_read_calculations on public.deadline_calculations for select to authenticated
  using ((select auth.uid()) = owner_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy owner_insert_calculations on public.deadline_calculations for insert to authenticated
  with check ((select auth.uid()) = owner_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy owner_delete_calculations on public.deadline_calculations for delete to authenticated
  using ((select auth.uid()) = owner_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));

-- No UPDATE grant or policy: snapshots cannot be edited through user sessions.
-- A user can still insert their own JSON through the Data API. Snapshots are
-- unverified evidence; the application recomputes input and never treats stored
-- JSON as an authoritative legal result. See docs/security/README.md.
