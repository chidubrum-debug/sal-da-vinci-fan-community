-- Run this in Supabase SQL Editor to upgrade the existing applications table.
-- It keeps existing records and adds fields used by the website and admin dashboard.
alter table public.applications
  add column if not exists reference text,
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists membership_type text,
  add column if not exists membership_tier text,
  add column if not exists status text default 'pending',
  add column if not exists photo_consent boolean not null default false;

update public.applications set reference = 'SDV-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)) where reference is null;
update public.applications set membership_type = case when application_type ilike '%fan%' then 'fan' else 'membership' end where membership_type is null;
update public.applications set status = case when review_status = 'Approved' then 'approved' when review_status = 'Declined' then 'rejected' else 'pending' end where status is null or status = 'pending';
alter table public.applications alter column reference set not null;
create unique index if not exists applications_reference_key on public.applications(reference);
