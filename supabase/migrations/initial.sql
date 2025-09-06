-- ========== EXTENSIONS (krävs för UUID) ==========
create extension if not exists pgcrypto;

-- ========== PROFILES ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  language text default 'sv',
  created_at timestamptz default now()
);

-- ========== MOODS ==========
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score between 1 and 10),
  tags text[] default '{}',
  note text,
  created_at timestamptz default now()
);
create index if not exists idx_moods_user_created on public.moods(user_id, created_at desc);

-- ========== JOURNAL ==========
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content jsonb,                   -- rich text (tiptap/json)
  feelings text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_journal_user_created on public.journal_entries(user_id, created_at desc);

-- ========== PLANS ==========
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz default now()
);
create index if not exists idx_plans_user on public.plans(user_id, created_at desc);

create table if not exists public.plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  title text not null,
  done boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_plan_tasks_plan_order on public.plan_tasks(plan_id, order_index);

create table if not exists public.plan_logs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  log text,
  created_at timestamptz default now()
);
create index if not exists idx_plan_logs_plan_created on public.plan_logs(plan_id, created_at desc);

-- ========== EXERCISES ==========
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title jsonb not null,            -- {"sv":"Andning 4-7-8","en":"Breathing 4-7-8", ...}
  description jsonb not null,
  media_url text,
  duration_seconds int,
  created_at timestamptz default now()
);

create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  completed_at timestamptz default now()
);
create index if not exists idx_ex_sessions_user_time on public.exercise_sessions(user_id, completed_at desc);

-- ========== AURI MESSAGES ==========
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_messages_user_time on public.messages(user_id, created_at desc);

-- ========== THERAPIST REQUESTS (stub) ==========
create table if not exists public.therapist_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text,
  details text,
  created_at timestamptz default now()
);
create index if not exists idx_ther_req_user_time on public.therapist_requests(user_id, created_at desc);

-- ========== RLS ON ==========
alter table public.profiles enable row level security;
alter table public.moods enable row level security;
alter table public.journal_entries enable row level security;
alter table public.plans enable row level security;
alter table public.plan_tasks enable row level security;
alter table public.plan_logs enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.therapist_requests enable row level security;

-- ========== POLICIES ==========
-- Profiles
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users can manage own profile') then
    create policy "Users can manage own profile" on public.profiles
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end$$;

-- Moods
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own moods') then
    create policy "Users read/write own moods" on public.moods
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- Journal
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own journal') then
    create policy "Users read/write own journal" on public.journal_entries
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- Plans
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own plans') then
    create policy "Users read/write own plans" on public.plans
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- Plan tasks
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own plan tasks') then
    create policy "Users read/write own plan tasks" on public.plan_tasks
      using (exists (
        select 1
        from public.plans p
        where p.id = plan_tasks.plan_id and p.user_id = auth.uid()
      ))
      with check (exists (
        select 1
        from public.plans p
        where p.id = plan_tasks.plan_id and p.user_id = auth.uid()
      ));
  end if;
end$$;

-- Plan logs
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own plan logs') then
    create policy "Users read/write own plan logs" on public.plan_logs
      using (exists (
        select 1
        from public.plans p
        where p.id = plan_logs.plan_id and p.user_id = auth.uid()
      ))
      with check (exists (
        select 1
        from public.plans p
        where p.id = plan_logs.plan_id and p.user_id = auth.uid()
      ));
  end if;
end$$;

-- Exercises (read all)
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read exercises') then
    create policy "Users read exercises" on public.exercises using (true);
  end if;
end$$;

-- Exercise sessions
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users write exercise sessions') then
    create policy "Users write exercise sessions" on public.exercise_sessions
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- Messages
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own messages') then
    create policy "Users read/write own messages" on public.messages
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- Therapist requests
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'Users read/write own therapist requests') then
    create policy "Users read/write own therapist requests" on public.therapist_requests
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

