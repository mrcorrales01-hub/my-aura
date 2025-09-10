-- Helper: only owner can access their rows
create or replace function public.is_owner(uid uuid) returns boolean
language sql stable as $$
  select auth.uid() = uid
$$;

-- PROFILES (1:1 med auth.users)
alter table public.profiles enable row level security;
drop policy if exists profiles_sel on public.profiles;
drop policy if exists profiles_upd on public.profiles;
create policy profiles_sel on public.profiles
  for select using ( id = auth.uid() );
create policy profiles_upd on public.profiles
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );

-- CONVERSATIONS (instead of sessions/messages pattern)
alter table public.conversations enable row level security;
drop policy if exists conversations_rw on public.conversations;
create policy conversations_rw on public.conversations
  for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- MOOD ENTRIES
alter table public.mood_entries enable row level security;
drop policy if exists mood_entries_rw on public.mood_entries;
create policy mood_entries_rw on public.mood_entries
  for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- DAILY QUESTS
alter table public.daily_quests enable row level security;
drop policy if exists daily_quests_rw on public.daily_quests;
create policy daily_quests_rw on public.daily_quests
  for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- AI ROLE SESSIONS (roleplay)
alter table public.ai_role_sessions enable row level security;
drop policy if exists ai_role_sessions_rw on public.ai_role_sessions;
create policy ai_role_sessions_rw on public.ai_role_sessions
  for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- EXERCISE SESSIONS
alter table public.exercise_sessions enable row level security;
drop policy if exists exercise_sessions_rw on public.exercise_sessions;
create policy exercise_sessions_rw on public.exercise_sessions
  for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- EXERCISES (public read-only)
alter table public.exercises enable row level security;
drop policy if exists exercises_public_read on public.exercises;
create policy exercises_public_read on public.exercises
  for select using ( true );

-- REVOKE broad privileges for anon/authenticated
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- Security audit tables - read own only
do $$
begin
  if to_regclass('public.audit_logs') is not null then
    alter table public.audit_logs enable row level security;
    drop policy if exists audit_read_own on public.audit_logs;
    revoke all on public.audit_logs from anon, authenticated;
    create policy audit_read_own on public.audit_logs for select using ( user_id = auth.uid() );
  end if;
  
  if to_regclass('public.security_events') is not null then
    alter table public.security_events enable row level security;
    drop policy if exists security_events_read_own on public.security_events;
    revoke all on public.security_events from anon, authenticated;
    create policy security_events_read_own on public.security_events for select using ( user_id = auth.uid() );
  end if;
end$$;