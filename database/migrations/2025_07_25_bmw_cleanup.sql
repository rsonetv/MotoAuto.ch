-- Migracja: Poprawka modeli BMW z podziałem na samochody i motocykle
-- Data: 2025-07-25
-- Opis: Rozdzielenie modeli BMW na kategorie samochodów i motocykli

-- Najpierw usuń istniejące nieprawidłowe wpisy BMW
DELETE FROM vehicle_models WHERE brand_id IN (
  SELECT id FROM vehicle_brands WHERE name = 'BMW'
);

-- Dodaj modele BMW dla samochodów
INSERT INTO vehicle_models (brand_id, name, category, variants, created_at, updated_at)
SELECT 
  b.id,
  model_data.name,
  'SAMOCHODY',
  model_data.variants::jsonb,
  NOW(),
  NOW()
FROM vehicle_brands b,
LATERAL (VALUES
  ('1 Series', '["116i", "118i", "120i", "125i", "M135i"]'),
  ('2 Series', '["218i", "220i", "225i", "M240i", "M2"]'),
  ('3 Series', '["318i", "320i", "325i", "330i", "335i", "M3"]'),
  ('4 Series', '["420i", "425i", "430i", "435i", "M4"]'),
  ('5 Series', '["520i", "525i", "530i", "535i", "540i", "M5"]'),
  ('6 Series', '["630i", "640i", "650i", "M6"]'),
  ('7 Series', '["730i", "740i", "750i", "760i"]'),
  ('8 Series', '["840i", "850i", "M8"]'),
  ('X1', '["sDrive18i", "sDrive20i", "xDrive20i", "xDrive25i"]'),
  ('X2', '["sDrive18i", "sDrive20i", "xDrive20i", "xDrive25i"]'),
  ('X3', '["sDrive20i", "xDrive20i", "xDrive30i", "M40i"]'),
  ('X4', '["xDrive20i", "xDrive30i", "M40i"]'),
  ('X5', '["xDrive30i", "xDrive40i", "xDrive50i", "M50i"]'),
  ('X6', '["xDrive40i", "xDrive50i", "M50i"]'),
  ('X7', '["xDrive40i", "xDrive50i", "M50i"]'),
  ('Z4', '["sDrive20i", "sDrive30i", "M40i"]'),
  ('i3', '["i3", "i3s"]'),
  ('i4', '["eDrive40", "M50"]'),
  ('iX', '["xDrive40", "xDrive50", "M60"]')
) AS model_data(name, variants)
WHERE b.name = 'BMW';

-- Dodaj modele BMW dla motocykli (BMW Motorrad)
INSERT INTO vehicle_models (brand_id, name, category, variants, created_at, updated_at)
SELECT 
  b.id,
  model_data.name,
  'MOTOCYKLE',
  model_data.variants::jsonb,
  NOW(),
  NOW()
FROM vehicle_brands b,
LATERAL (VALUES
  ('S Series', '["S 1000 RR", "S 1000 R", "S 1000 XR"]'),
  ('R Series', '["R 1250 GS", "R 1250 RT", "R 1250 R", "R 1200 GS"]'),
  ('F Series', '["F 850 GS", "F 750 GS", "F 900 R", "F 900 XR"]'),
  ('G Series', '["G 310 GS", "G 310 R"]'),
  ('K Series', '["K 1600 GT", "K 1600 GTL"]'),
  ('C Series', '["C 400 GT", "C 650 GT"]'),
  ('CE Series', '["CE 04"]')
) AS model_data(name, variants)
WHERE b.name = 'BMW Motorrad';

-- Dodaj BMW Motorrad jako osobną markę jeśli nie istnieje
INSERT INTO vehicle_brands (name, category, logo_url, created_at, updated_at)
SELECT 'BMW Motorrad', 'MOTOCYKLE', NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM vehicle_brands WHERE name = 'BMW Motorrad'
);

-- Aktualizuj istniejące ogłoszenia BMW motocykli
UPDATE listings 
SET brand = 'BMW Motorrad'
WHERE brand = 'BMW' 
  AND category = 'MOTOCYKLE';

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_category 
ON vehicle_models(brand_id, category);

CREATE INDEX IF NOT EXISTS idx_listings_brand_category 
ON listings(brand, category);

-- Komentarz końcowy
COMMENT ON TABLE vehicle_models IS 'Tabela modeli pojazdów z podziałem na kategorie i warianty w formacie JSON';