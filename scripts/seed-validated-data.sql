-- Insert validated sample profiles
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  email_verified,
  is_dealer,
  dealer_name,
  dealer_license
) VALUES 
(
  gen_random_uuid(),
  'john.doe@example.com',
  'John Doe',
  '+41 79 123 45 67',
  true,
  false,
  NULL,
  NULL
),
(
  gen_random_uuid(),
  'dealer@autohaus.ch',
  'Hans Mueller',
  '+41 44 123 45 67',
  true,
  true,
  'Autohaus Mueller AG',
  'CH-DEL-001'
),
(
  gen_random_uuid(),
  'maria.garcia@email.com',
  'Maria Garcia',
  '+41 76 987 65 43',
  true,
  false,
  NULL,
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- Insert validated sample listings
WITH sample_users AS (
  SELECT id, email FROM profiles LIMIT 3
)
INSERT INTO listings (
  user_id,
  title,
  description,
  price,
  category,
  brand,
  model,
  year,
  mileage,
  engine_capacity,
  power,
  fuel_type,
  transmission,
  drive_type,
  body_type,
  doors,
  seats,
  color,
  condition,
  accident_free,
  owners_count,
  has_service_book,
  location,
  postal_code,
  images,
  is_auction,
  auction_end_time,
  min_bid_increment,
  status
) 
SELECT 
  u.id,
  'BMW 320i Executive - Excellent Condition',
  'Beautiful BMW 320i in excellent condition. Full service history, accident-free, single owner. Perfect for daily commuting or weekend trips. All maintenance up to date.',
  25000.00,
  'auto',
  'BMW',
  '320i',
  2019,
  45000,
  2.0,
  184,
  'petrol',
  'automatic',
  'rwd',
  'sedan',
  4,
  5,
  'Alpine White',
  'used',
  true,
  1,
  true,
  'Zurich, Switzerland',
  '8001',
  ARRAY['https://example.com/bmw1.jpg', 'https://example.com/bmw2.jpg'],
  false,
  NULL,
  50.00,
  'active'
FROM sample_users u
WHERE u.email = 'john.doe@example.com'

UNION ALL

SELECT 
  u.id,
  'Audi A4 Avant Quattro - Premium Package',
  'Stunning Audi A4 Avant with Quattro all-wheel drive. Loaded with premium features including leather seats, navigation system, and advanced safety features.',
  32000.00,
  'auto',
  'Audi',
  'A4 Avant',
  2020,
  35000,
  2.0,
  190,
  'diesel',
  'automatic',
  'awd',
  'wagon',
  5,
  5,
  'Phantom Black',
  'used',
  true,
  1,
  true,
  'Geneva, Switzerland',
  '1201',
  ARRAY['https://example.com/audi1.jpg', 'https://example.com/audi2.jpg', 'https://example.com/audi3.jpg'],
  true,
  now() + interval '7 days',
  100.00,
  'active'
FROM sample_users u
WHERE u.email = 'dealer@autohaus.ch'

UNION ALL

SELECT 
  u.id,
  'Honda CBR600RR - Track Ready Sportbike',
  'Pristine Honda CBR600RR in racing condition. Perfect for track days or spirited road riding. Recently serviced with new tires and chain.',
  8500.00,
  'moto',
  'Honda',
  'CBR600RR',
  2018,
  12000,
  0.6,
  120,
  'petrol',
  'manual',
  NULL,
  NULL,
  NULL,
  2,
  'Red',
  'used',
  true,
  2,
  true,
  'Basel, Switzerland',
  '4001',
  ARRAY['https://example.com/honda1.jpg', 'https://example.com/honda2.jpg'],
  false,
  NULL,
  25.00,
  'active'
FROM sample_users u
WHERE u.email = 'maria.garcia@email.com';

-- Insert validated sample bids for auction listing
WITH auction_listing AS (
  SELECT id FROM listings WHERE is_auction = true LIMIT 1
),
bidder AS (
  SELECT id FROM profiles WHERE email = 'john.doe@example.com'
)
INSERT INTO bids (
  listing_id,
  user_id,
  amount,
  is_auto_bid,
  max_auto_bid
)
SELECT 
  al.id,
  b.id,
  32500.00,
  true,
  35000.00
FROM auction_listing al, bidder b;

-- Insert sample favorites
WITH favorite_listing AS (
  SELECT id FROM listings WHERE brand = 'BMW' LIMIT 1
),
user_who_favorites AS (
  SELECT id FROM profiles WHERE email = 'maria.garcia@email.com'
)
INSERT INTO favorites (user_id, listing_id)
SELECT uwf.id, fl.id
FROM user_who_favorites uwf, favorite_listing fl;

-- Verify data integrity
DO $$
DECLARE
  profile_count integer;
  listing_count integer;
  bid_count integer;
  favorite_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO listing_count FROM listings;
  SELECT COUNT(*) INTO bid_count FROM bids;
  SELECT COUNT(*) INTO favorite_count FROM favorites;
  
  RAISE NOTICE 'Data seeding completed successfully:';
  RAISE NOTICE '- Profiles: %', profile_count;
  RAISE NOTICE '- Listings: %', listing_count;
  RAISE NOTICE '- Bids: %', bid_count;
  RAISE NOTICE '- Favorites: %', favorite_count;
  
  -- Validate that all data conforms to schemas
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE NOT jsonb_matches_schema(
      get_profile_schema(), 
      to_jsonb(profiles.*) - 'id'::text
    )
  ) THEN
    RAISE EXCEPTION 'Profile data validation failed';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM listings 
    WHERE NOT jsonb_matches_schema(
      get_listing_schema(), 
      to_jsonb(listings.*) - 'id'::text
    )
  ) THEN
    RAISE EXCEPTION 'Listing data validation failed';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM bids 
    WHERE NOT jsonb_matches_schema(
      get_bid_schema(), 
      to_jsonb(bids.*) - 'id'::text
    )
  ) THEN
    RAISE EXCEPTION 'Bid data validation failed';
  END IF;
  
  RAISE NOTICE 'All data validation checks passed successfully!';
END;
$$;
