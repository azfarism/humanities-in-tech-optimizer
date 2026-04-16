-- Enable extension for UUID generation (if not already enabled)
create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  resume_text text not null default '',
  job_listing_text text not null default '',
  follow_up_answers jsonb not null default '{}'::jsonb,

  -- Placeholder generation outputs for Day 1
  rewritten_cv text,
  cover_letter text,
  checklist text,
  gap_note text,

  status text not null default 'draft' check (status in ('draft', 'ready_for_generation', 'generated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_updated_at_idx on public.applications(updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "Users can read own applications" on public.applications;
create policy "Users can read own applications"
on public.applications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own applications" on public.applications;
create policy "Users can insert own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own applications" on public.applications;
create policy "Users can update own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own applications" on public.applications;
create policy "Users can delete own applications"
on public.applications
for delete
using (auth.uid() = user_id);
