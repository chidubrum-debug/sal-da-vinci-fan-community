-- Sal Da Vinci Fan Community schema
-- Run in Supabase SQL Editor. Then create the first auth user manually and add its UUID below.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  date_of_birth date not null,
  country text not null,
  membership_type text not null check (membership_type in ('membership','fan')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  photo_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  provider text not null check (provider in ('paypal','card','bank_transfer','gift_card')),
  provider_reference text,
  status text not null default 'pending' check (status in ('pending','successful','failed')),
  amount numeric(12,2),
  currency text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,provider_reference)
);

alter table public.admin_users enable row level security;
alter table public.applications enable row level security;
alter table public.payments enable row level security;

-- No public policies: anonymous/authenticated applicants cannot read or mutate these tables.
-- Netlify submission function uses service-role key server-side for controlled inserts.
-- Admins can read/update only when their auth.uid() is present in admin_users.
create policy "admins read own admin record" on public.admin_users
 for select to authenticated using (user_id = auth.uid());

create policy "admins read applications" on public.applications
 for select to authenticated using (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
);
create policy "admins update applications" on public.applications
 for update to authenticated using (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
) with check (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
);

create policy "admins read payments" on public.payments
 for select to authenticated using (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
);
create policy "admins update payments" on public.payments
 for update to authenticated using (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
) with check (
   exists(select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- IMPORTANT: no admin registration UI or public insert policy for admin_users.
-- After creating your admin Auth user in Supabase Dashboard > Authentication > Users,
-- replace AUTH_USER_UUID and run:
-- insert into public.admin_users(user_id,email)
-- values ('AUTH_USER_UUID','mypersonalytip@gmail.com');

-- Do not add a client-side policy that exposes applications to anon users.
-- Payment rows are created/updated only by trusted server-side provider webhook code.
