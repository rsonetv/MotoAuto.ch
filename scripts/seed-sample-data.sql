-- Sample data for MotoAuto.ch
-- Run this after setting up the database
-- Using actual User UID: 21837461-2dc6-4ce1-a34e-41558e912541

-- Insert sample listings
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
  body_type,
  doors,
  seats,
  color,
  condition,
  location,
  images,
  status
) VALUES
-- Cars
(
  '21837461-2dc6-4ce1-a34e-41558e912541', -- Using actual user UID
  'Audi A4 Avant 2.0 TFSI quattro',
  'Piękny Audi A4 Avant w doskonałym stanie technicznym. Pierwszy właściciel, serwisowany w ASO. Wyposażenie: skórzana tapicerka, nawigacja, kamera cofania, czujniki parkowania.',
  45000.00,
  'auto',
  'Audi',
  'A4 Avant',
  2020,
  85000,
  2000,
  190,
  'Benzyna',
  'Automatyczna',
  'Kombi',
  5,
  5,
  'Czarny',
  'Bardzo dobry',
  'Zürich',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
),
(
  '21837461-2dc6-4ce1-a34e-41558e912541',
  'BMW 320d xDrive Touring',
  'Niezawodne BMW 320d z napędem na cztery koła. Idealny do długich podróży. Regularnie serwisowany, wszystkie przeglądy w terminie.',
  38000.00,
  'auto',
  'BMW',
  '320d',
  2019,
  120000,
  2000,
  190,
  'Diesel',
  'Automatyczna',
  'Kombi',
  5,
  5,
  'Biały',
  'Dobry',
  'Basel',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
),
(
  '21837461-2dc6-4ce1-a34e-41558e912541',
  'Mercedes-Benz C-Class AMG',
  'Sportowy Mercedes C-Class w wersji AMG. Niesamowite osiągi i luksusowe wykończenie. Auto dla prawdziwych miłośników motoryzacji.',
  65000.00,
  'auto',
  'Mercedes-Benz',
  'C-Class',
  2021,
  45000,
  3000,
  385,
  'Benzyna',
  'Automatyczna',
  'Sedan',
  4,
  5,
  'Srebrny',
  'Bardzo dobry',
  'Geneva',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
),

-- Motorcycles
(
  '21837461-2dc6-4ce1-a34e-41558e912541',
  'Yamaha YZF-R1M',
  'Topowy motocykl sportowy Yamaha R1M. Limitowana edycja z pakietem elektroniki. Idealny stan, mało używany.',
  25000.00,
  'moto',
  'Yamaha',
  'YZF-R1M',
  2022,
  8500,
  998,
  200,
  'Benzyna',
  'Manualna',
  'Sportowy',
  NULL,
  2,
  'Niebieski',
  'Bardzo dobry',
  'Bern',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
),
(
  '21837461-2dc6-4ce1-a34e-41558e912541',
  'BMW R 1250 GS Adventure',
  'Legendarny BMW GS w wersji Adventure. Gotowy na każdą przygodę. Bogato wyposażony, z dodatkowymi bagażnikami.',
  18500.00,
  'moto',
  'BMW',
  'R 1250 GS',
  2020,
  35000,
  1254,
  136,
  'Benzyna',
  'Manualna',
  'Adventure',
  NULL,
  2,
  'Pomarańczowy',
  'Dobry',
  'Lucerne',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
),

-- Auction listings
(
  '21837461-2dc6-4ce1-a34e-41558e912541',
  'Porsche 911 Carrera S - AUKCJA',
  'Klasyczne Porsche 911 na aukcji! Rzadki egzemplarz w doskonałym stanie. Oryginalne lakierowanie, kompletna dokumentacja.',
  85000.00,
  'auto',
  'Porsche',
  '911',
  2018,
  65000,
  3000,
  420,
  'Benzyna',
  'Automatyczna',
  'Coupe',
  2,
  4,
  'Czerwony',
  'Bardzo dobry',
  'Zürich',
  ARRAY['/placeholder.svg?height=300&width=400'],
  'active'
);

-- Update the auction listing to be an actual auction
UPDATE listings 
SET 
  is_auction = true,
  auction_start_time = NOW(),
  auction_end_time = NOW() + INTERVAL '7 days',
  current_bid = 85000.00,
  min_bid_increment = 1000.00,
  reserve_price = 90000.00
WHERE title LIKE '%AUKCJA%';

-- Insert sample bids for the auction
INSERT INTO bids (listing_id, user_id, amount, placed_at) VALUES
((SELECT id FROM listings WHERE is_auction = true LIMIT 1), '21837461-2dc6-4ce1-a34e-41558e912541', 85000.00, NOW() - INTERVAL '2 days'),
((SELECT id FROM listings WHERE is_auction = true LIMIT 1), '21837461-2dc6-4ce1-a34e-41558e912541', 87000.00, NOW() - INTERVAL '1 day'),
((SELECT id FROM listings WHERE is_auction = true LIMIT 1), '21837461-2dc6-4ce1-a34e-41558e912541', 89000.00, NOW() - INTERVAL '12 hours');

-- Insert sample favorites
INSERT INTO favorites (user_id, listing_id) VALUES
('21837461-2dc6-4ce1-a34e-41558e912541', 1),
('21837461-2dc6-4ce1-a34e-41558e912541', 3),
('21837461-2dc6-4ce1-a34e-41558e912541', 4);

-- Update view counts for some listings
UPDATE listings SET views = FLOOR(RANDOM() * 1000) + 50;
