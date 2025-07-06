-- Function to increment views
create or replace function increment_views(listing_id integer)
returns void as $$
begin
  update listings 
  set views = views + 1 
  where id = listing_id;
end;
$$ language plpgsql security definer;

-- Function to get highest bid for a listing
create or replace function get_highest_bid(listing_id integer)
returns numeric as $$
declare
  highest_bid numeric;
begin
  select max(amount) into highest_bid
  from bids
  where bids.listing_id = get_highest_bid.listing_id;
  
  return coalesce(highest_bid, 0);
end;
$$ language plpgsql security definer;

-- Function to check if auction has ended
create or replace function is_auction_ended(listing_id integer)
returns boolean as $$
declare
  end_time timestamp with time zone;
begin
  select auction_end_time into end_time
  from listings
  where id = listing_id;
  
  return end_time < now();
end;
$$ language plpgsql security definer;
