-- Waitlist table (public insert for landing page)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  interest text, -- 'user' | 'clinic' | 'employer'
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

create policy "Allow public insert on waitlist"
on public.waitlist
for insert
with check (true);

-- Marketing leads table (clinics/employers)
create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('clinic','employer')),
  org text,
  contact_name text,
  email text not null,
  phone text,
  message text,
  created_at timestamptz default now()
);

alter table public.marketing_leads enable row level security;

create policy "Allow public insert on marketing_leads"
on public.marketing_leads
for insert
with check (true);