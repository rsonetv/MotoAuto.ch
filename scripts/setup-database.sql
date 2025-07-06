-- 1. Profiles (rozszerzona tabela użytkowników)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  avatar_url text,
  phone text,
  email_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Listings (ogłoszenia i aukcje)
create table if not exists listings (
  id serial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(10,2) not null,
  category text not null,
  brand text,
  model text,
  year integer,
  mileage integer,
  fuel_type text,
  transmission text,
  location text not null,
  images text[] default '{}',
  is_auction boolean default false,
  auction_end_time timestamp with time zone,
  current_bid numeric(10,2),
  min_increment numeric(8,2) default 1.00,
  buy_now_price numeric(10,2),
  status text not null default 'active' check (status in ('active','sold','expired')),
  views integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. Bids (oferty na aukcjach)
create table if not exists bids (
  id serial primary key,
  listing_id integer not null references listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  placed_at timestamp with time zone default now()
);

-- 4. Indeksy wydajnościowe
create index if not exists idx_listings_status_end on listings(status, auction_end_time);
create index if not exists idx_listings_category on listings(category);
create index if not exists idx_listings_user on listings(user_id);
create index if not exists idx_bids_listing on bids(listing_id);
create index if not exists idx_bids_user on bids(user_id);

-- 5. Row Level Security
alter table listings enable row level security;
alter table bids enable row level security;

-- Profile policies
create policy "Profiles select" on profiles
  for select using (true);

-- Listings policies
create policy "Users can view active listings" on listings
  for select using (status = 'active' or auth.uid() = user_id);

create policy "Users can insert listings" on listings
  for insert with check (auth.uid() = user_id);

create policy "Users can modify own listings" on listings
  for update using (auth.uid() = user_id);

create policy "Users can delete own listings" on listings
  for delete using (auth.uid() = user_id);

-- Bids policies
create policy "Users can view bids on own or active auctions" on bids
  for select using (
    exists (select 1 from listings where id = listing_id and (auth.uid() = user_id or status = 'active'))
  );

create policy "Users can place bid if auction active and not own listing" on bids
  for insert with check (
    auth.uid() != (select user_id from listings where id = listing_id)
    and exists (select 1 from listings where id = listing_id and is_auction and status = 'active' and auction_end_time > now())
  );
