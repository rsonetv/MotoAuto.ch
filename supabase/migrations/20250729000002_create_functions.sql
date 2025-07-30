-- Create database functions for MotoAuto.ch
-- Author: MotoAuto.ch Team
-- Date: 2025-07-29

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to execute SQL (replacement for missing public.exec)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment listing views
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE(
  active_listings BIGINT,
  total_views BIGINT,
  active_bids BIGINT,
  successful_sales BIGINT,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.listings WHERE user_id = user_uuid AND status = 'active')::BIGINT,
    (SELECT COALESCE(SUM(views), 0) FROM public.listings WHERE user_id = user_uuid)::BIGINT,
    (SELECT COUNT(*) FROM public.bids WHERE user_id = user_uuid AND status IN ('active', 'winning'))::BIGINT,
    (SELECT COUNT(*) FROM public.listings WHERE user_id = user_uuid AND status = 'sold')::BIGINT,
    (SELECT COALESCE(SUM(price), 0) FROM public.listings WHERE user_id = user_uuid AND status = 'sold')::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update listing bid information
CREATE OR REPLACE FUNCTION public.update_listing_bid(
  listing_uuid UUID,
  new_bid_amount DECIMAL,
  bidder_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_highest DECIMAL;
  reserve_price DECIMAL;
BEGIN
  -- Get current highest bid and reserve price
  SELECT current_bid, listings.reserve_price 
  INTO current_highest, reserve_price
  FROM public.listings 
  WHERE id = listing_uuid;
  
  -- Check if new bid is higher than current
  IF new_bid_amount > COALESCE(current_highest, 0) THEN
    -- Update listing with new highest bid
    UPDATE public.listings 
    SET 
      current_bid = new_bid_amount,
      bid_count = bid_count + 1,
      is_reserve_met = CASE 
        WHEN reserve_price IS NOT NULL AND new_bid_amount >= reserve_price THEN TRUE
        ELSE is_reserve_met
      END,
      updated_at = NOW()
    WHERE id = listing_uuid;
    
    -- Update previous winning bids to outbid
    UPDATE public.bids 
    SET status = 'outbid', updated_at = NOW()
    WHERE listing_id = listing_uuid AND status = 'winning' AND user_id != bidder_uuid;
    
    -- Update current bid to winning
    UPDATE public.bids 
    SET status = 'winning', updated_at = NOW()
    WHERE listing_id = listing_uuid AND user_id = bidder_uuid AND amount = new_bid_amount;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search listings with filters
CREATE OR REPLACE FUNCTION public.search_listings(
  search_query TEXT DEFAULT NULL,
  category_slug TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  brand_filter TEXT DEFAULT NULL,
  year_from INTEGER DEFAULT NULL,
  year_to INTEGER DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  price DECIMAL,
  currency TEXT,
  mileage INTEGER,
  location TEXT,
  images TEXT[],
  views INTEGER,
  created_at TIMESTAMPTZ,
  category_name TEXT,
  user_full_name TEXT,
  user_is_dealer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.brand,
    l.model,
    l.year,
    l.price,
    l.currency,
    l.mileage,
    l.location,
    l.images,
    l.views,
    l.created_at,
    c.name as category_name,
    p.full_name as user_full_name,
    p.is_dealer as user_is_dealer
  FROM public.listings l
  LEFT JOIN public.categories c ON l.category_id = c.id
  LEFT JOIN public.profiles p ON l.user_id = p.id
  WHERE 
    l.status = 'active'
    AND (search_query IS NULL OR (
      l.title ILIKE '%' || search_query || '%' 
      OR l.brand ILIKE '%' || search_query || '%'
      OR l.model ILIKE '%' || search_query || '%'
    ))
    AND (category_slug IS NULL OR c.slug = category_slug)
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (brand_filter IS NULL OR l.brand = brand_filter)
    AND (year_from IS NULL OR l.year >= year_from)
    AND (year_to IS NULL OR l.year <= year_to)
  ORDER BY l.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
