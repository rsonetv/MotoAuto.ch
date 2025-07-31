create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profile: select own"
  on public.profiles for select using (auth.uid() = id);

create policy "Profile: insert own"
  on public.profiles for insert with check (auth.uid() = id);