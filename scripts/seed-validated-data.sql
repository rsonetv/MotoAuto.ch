-- scripts/seed-validated-data.sql  (FINAL FIX)

TRUNCATE TABLE favorites, bids, listings, profiles, users RESTART IDENTITY CASCADE;

-- users
INSERT INTO users(id,email) VALUES
 ('550e8400-e29b-41d4-a716-446655440001','john.doe@example.com'),
 ('550e8400-e29b-41d4-a716-446655440002','dealer@autohaus.ch'),
 ('550e8400-e29b-41d4-a716-446655440003','maria.garcia@email.com');

-- profiles
INSERT INTO profiles(id,email,full_name,phone,email_verified,phone_verified,is_dealer,dealer_name,dealer_license,location,postal_code)
VALUES
 ('550e8400-e29b-41d4-a716-446655440001','john.doe@example.com','John Doe','+41 79 123 45 67',true,true,false,NULL,NULL,'Zurich, Switzerland','8001'),
 ('550e8400-e29b-41d4-a716-446655440002','dealer@autohaus.ch','Hans Mueller','+41 44 123 45 67',true,true,true,'Autohaus Mueller AG','CH-DEL-001','Geneva, Switzerland','1201'),
 ('550e8400-e29b-41d4-a716-446655440003','maria.garcia@email.com','Maria Garcia','+41 76 987 65 43',true,false,false,NULL,NULL,'Basel, Switzerland','4001');

-- listings : 31 kolumn – zachowaj kolejność!
INSERT INTO listings(
 user_id,title,description,price,
 category,brand,model,year,mileage,
 engine_capacity,power,
 fuel_type,transmission,color,
 condition,accident_free,owners_count,has_service_book,
 location,postal_code,images,
 is_auction,auction_end_time,min_bid_increment,
 reserve_price,current_bid,bid_count,
 status,views,created_at,updated_at)
VALUES
-- BMW (fixed-price)
 ('550e8400-e29b-41d4-a716-446655440001',
  'BMW 320i Executive – Excellent Condition',
  'Beautiful BMW 320i … single owner.',
  25000.00,
  'auto','BMW','320i',2019,45000,
  2.0,184,
  'petrol','automatic','Alpine White',
  'used',true,1,true,
  'Zurich, Switzerland','8001',
  ARRAY['https://ex.com/bmw1.jpg','https://ex.com/bmw2.jpg'],
  false,NULL,50.00,
  NULL,NULL,0,
  'active',125,NOW(),NOW()),

-- Audi (auction)
 ('550e8400-e29b-41d4-a716-446655440002',
  'Audi A4 Avant Quattro – Premium Package',
  'Stunning Audi A4 Avant … premium features.',
  32000.00,
  'auto','Audi','A4 Avant',2020,35000,
  2.0,190,
  'diesel','automatic','Phantom Black',
  'used',true,1,true,
  'Geneva, Switzerland','1201',
  ARRAY['https://ex.com/a1.jpg','https://ex.com/a2.jpg','https://ex.com/a3.jpg'],
  true,NOW()+INTERVAL '7 days',100.00,
  30000.00,NULL,0,
  'active',89,NOW(),NOW()),

-- Honda (fixed-price)
 ('550e8400-e29b-41d4-a716-446655440003',
  'Honda CBR600RR – Track Ready Sportbike',
  'Pristine Honda CBR600RR … racing condition.',
  8500.00,
  'moto','Honda','CBR600RR',2018,12000,
  0.6,120,
  'petrol','manual','Red',
  'used',true,2,true,
  'Basel, Switzerland','4001',
  ARRAY['https://ex.com/h1.jpg','https://ex.com/h2.jpg'],
  false,NULL,25.00,
  NULL,NULL,0,
  'active',67,NOW(),NOW());

-- bids (on Audi auction)
INSERT INTO bids(listing_id,user_id,amount,is_auto_bid,max_auto_bid,status)
SELECT l.id, '550e8400-e29b-41d4-a716-446655440001', 32500.00, true,35000.00,'active'
FROM listings l WHERE l.is_auction LIMIT 1;

-- favorites
INSERT INTO favorites(user_id,listing_id)
SELECT '550e8400-e29b-41d4-a716-446655440003', l.id
FROM listings l WHERE brand='BMW' LIMIT 1;

-- integrity check
DO $$
BEGIN
 RAISE NOTICE '✓ seed-data loaded bez błędów';
END$$;
