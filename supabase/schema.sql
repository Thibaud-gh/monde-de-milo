-- Run once in the SQL editor of a new Supabase project.
-- One pseudonymous learner per parent account for milestone 1.
begin;
create table public.learner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  nickname text not null default 'Milo learner' check (char_length(nickname) between 1 and 80),
  lesson smallint not null default 1 check (lesson between 1 and 3),
  lesson_updated_at timestamptz not null default '1970-01-01T00:00:00Z',
  created_at timestamptz not null default now(),
  constraint profile_is_owner check (id = owner_id),
  unique (id, owner_id)
);
create table public.learning_events (
  id uuid primary key,
  profile_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null check (
    jsonb_typeof(payload) = 'object'
    and payload ? 'kind'
    and payload->>'kind' in ('attempt', 'engagement', 'assessment')
    and octet_length(payload::text) <= 12000
  ),
  foreign key (profile_id, owner_id) references public.learner_profiles(id, owner_id) on delete cascade
);
create index learning_events_profile_time on public.learning_events(profile_id, created_at, id);
alter table public.learner_profiles enable row level security;
alter table public.learning_events enable row level security;
revoke all on public.learner_profiles, public.learning_events from anon;
revoke all on public.learner_profiles, public.learning_events from authenticated;
grant select, insert, update on public.learner_profiles to authenticated;
grant select, insert on public.learning_events to authenticated;
create policy "Parent reads own learner" on public.learner_profiles for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Parent creates own learner" on public.learner_profiles for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Parent updates own learner" on public.learner_profiles for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Parent reads own events" on public.learning_events for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Parent appends own events" on public.learning_events for insert to authenticated with check ((select auth.uid()) = owner_id);
-- Events are immutable. Repeated uploads use INSERT ON CONFLICT DO NOTHING,
-- with stable UUIDs; they cannot duplicate a record or overwrite someone else's.
commit;
