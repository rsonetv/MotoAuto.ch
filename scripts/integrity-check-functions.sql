-- Function to check for orphaned bids
CREATE OR REPLACE FUNCTION check_orphaned_bids()
RETURNS integer AS $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM bids b
  WHERE NOT EXISTS (SELECT 1 FROM listings l WHERE l.id = b.listing_id)
     OR NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = b.user_id);
  
  RETURN orphaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for orphaned favorites
CREATE OR REPLACE FUNCTION check_orphaned_favorites()
RETURNS integer AS $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM favorites f
  WHERE NOT EXISTS (SELECT 1 FROM listings l WHERE l.id = f.listing_id)
     OR NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = f.user_id);
  
  RETURN orphaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for invalid bids
CREATE OR REPLACE FUNCTION check_invalid_bids()
RETURNS integer AS $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM bids b
  JOIN listings l ON b.listing_id = l.id
  WHERE l.buy_now_price IS NOT NULL 
    AND b.amount > l.buy_now_price;
  
  RETURN invalid_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired auctions
CREATE OR REPLACE FUNCTION cleanup_expired_auctions()
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE listings 
  SET status = 'expired',
      updated_at = now()
  WHERE is_auction = true 
    AND status = 'active' 
    AND auction_end_time < now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate favorites count
CREATE OR REPLACE FUNCTION recalculate_favorites_count()
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE listings 
  SET favorites_count = (
    SELECT COUNT(*) 
    FROM favorites 
    WHERE listing_id = listings.id
  ),
  updated_at = now()
  WHERE favorites_count != (
    SELECT COUNT(*) 
    FROM favorites 
    WHERE listing_id = listings.id
  );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate all existing data
CREATE OR REPLACE FUNCTION validate_all_data()
RETURNS TABLE(
  table_name text,
  record_id text,
  validation_errors text[]
) AS $$
BEGIN
  -- Validate profiles
  RETURN QUERY
  SELECT 
    'profiles'::text,
    p.id::text,
    ARRAY['Profile validation failed']::text[]
  FROM profiles p
  WHERE NOT jsonb_matches_schema(
    get_profile_schema(),
    to_jsonb(p.*) - 'id'::text
  );
  
  -- Validate listings
  RETURN QUERY
  SELECT 
    'listings'::text,
    l.id::text,
    ARRAY['Listing validation failed']::text[]
  FROM listings l
  WHERE NOT jsonb_matches_schema(
    get_listing_schema(),
    to_jsonb(l.*) - 'id'::text
  );
  
  -- Validate bids
  RETURN QUERY
  SELECT 
    'bids'::text,
    b.id::text,
    ARRAY['Bid validation failed']::text[]
  FROM bids b
  WHERE NOT jsonb_matches_schema(
    get_bid_schema(),
    to_jsonb(b.*) - 'id'::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
