-- Run this once in the Supabase SQL Editor for an existing installation.
-- New applications require all three fields; existing rows remain valid.
alter table public.applications
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists date_of_birth date;
