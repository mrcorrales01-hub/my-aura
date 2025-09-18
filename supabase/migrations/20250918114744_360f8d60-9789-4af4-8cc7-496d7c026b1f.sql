-- Create reminders table if not exists
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  type text not null check (type in ('checkin','exercise','visit')),
  local_time time not null,
  weekdays int[] not null default '{1,2,3,4,5,6,7}',
  tz text not null default 'Europe/Stockholm',
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.reminders enable row level security;

-- Create policy for user access
drop policy if exists "own reminders" on public.reminders;
create policy "own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);