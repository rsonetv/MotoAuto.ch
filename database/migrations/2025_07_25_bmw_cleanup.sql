-- Migracja: Poprawa struktury BMW i dodanie nowych tabel
-- Data: 2025-07-25
-- Opis: Rozdzielenie modeli BMW na samochody i motocykle, dodanie tabel dla ogłoszeń

-- 1. Tworzenie tabeli ogłoszeń
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Podstawowe informacje
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Kategoria i typ
    main_category VARCHAR(20) NOT NULL CHECK (main_category IN ('SAMOCHODY', 'MOTOCYKLE', 'DOSTAWCZE')),
    vehicle_type VARCHAR(50),
    
    -- Dane pojazdu
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    mileage INTEGER CHECK (mileage >= 0),
    
    -- Dane techniczne
    fuel_type VARCHAR(30),
    transmission VARCHAR(30),
    engine_capacity INTEGER CHECK (engine_capacity >= 0),
    power INTEGER CHECK (power >= 0),
    condition VARCHAR(30),
    
    -- Cena i sprzedaż
    sale_type VARCHAR(20) NOT NULL CHECK (sale_type IN ('Kup Teraz', 'Aukcja')),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('CHF', 'EUR', 'USD')),
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    reserve_price DECIMAL(12,2) CHECK (reserve_price > 0),
    buy_now_price DECIMAL(12,2) CHECK (buy_now_price > 0),
    
    -- Lokalizacja
    country VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    place_id VARCHAR(255),
    
    -- Dodatkowe informacje
    features JSONB DEFAULT '[]',
    financing_options JSONB DEFAULT '[]',
    transport_options JSONB DEFAULT '[]',
    additional_info TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Metadane
    category_redirect VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'expired')),
    views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 2. Tworzenie tabeli zdjęć ogłoszeń
CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tworzenie tabeli marek i modeli
CREATE TABLE IF NOT EXISTS vehicle_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('SAMOCHODY', 'MOTOCYKLE', 'DOSTAWCZE')),
    subcategory VARCHAR(50),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES vehicle_brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('SAMOCHODY', 'MOTOCYKLE', 'DOSTAWCZE')),
    series VARCHAR(50),
    body_type VARCHAR(30),
    engine_types JSONB DEFAULT '[]',
    production_start INTEGER,
    production_end INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, name, category)
);

-- 4. Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(main_category);
CREATE INDEX IF NOT EXISTS idx_listings_sale_type ON listings(sale_type);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, country);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON listing_images(listing_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_vehicle_brands_category ON vehicle_brands(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_category ON vehicle_models(brand_id, category);

-- 5. Wstawienie danych BMW z poprawnym rozdzieleniem
INSERT INTO vehicle_brands (name, category, subcategory) VALUES 
('BMW', 'SAMOCHODY', 'Premium'),
('BMW', 'MOTOCYKLE', 'Europejskie')
ON CONFLICT (name) DO NOTHING;

-- Modele BMW samochodów
WITH bmw_cars AS (
    SELECT id FROM vehicle_brands WHERE name = 'BMW' AND category = 'SAMOCHODY'
)
INSERT INTO vehicle_models (brand_id, name, category, series) 
SELECT 
    bmw_cars.id,
    model_name,
    'SAMOCHODY',
    CASE 
        WHEN model_name LIKE '1%' THEN 'Seria 1'
        WHEN model_name LIKE '2%' THEN 'Seria 2'
        WHEN model_name LIKE '3%' THEN 'Seria 3'
        WHEN model_name LIKE '4%' THEN 'Seria 4'
        WHEN model_name LIKE '5%' THEN 'Seria 5'
        WHEN model_name LIKE '6%' THEN 'Seria 6'
        WHEN model_name LIKE '7%' THEN 'Seria 7'
        WHEN model_name LIKE '8%' THEN 'Seria 8'
        WHEN model_name LIKE 'X%' THEN 'X Series'
        WHEN model_name LIKE 'Z%' THEN 'Z Series'
        WHEN model_name LIKE 'i%' THEN 'i Series'
        WHEN model_name LIKE 'M%' THEN 'M Series'
        ELSE 'Inne'
    END
FROM bmw_cars,
UNNEST(ARRAY[
    '116i', '118i', '120i', '125i', 'M135i',
    '218i', '220i', '225xe', 'M235i', 'M240i',
    '318i', '320i', '325i', '330i', '335i', 'M3',
    '420i', '430i', '440i', 'M4',
    '520i', '525i', '530i', '540i', 'M5',
    '630i', '640i', '650i', 'M6',
    '730i', '740i', '750i', '760i',
    '840i', '850i', 'M8',
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7',
    'Z3', 'Z4', 'Z8',
    'i3', 'i4', 'i7', 'i8', 'iX', 'iX3'
]) AS model_name
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Modele BMW motocykli
WITH bmw_moto AS (
    SELECT id FROM vehicle_brands WHERE name = 'BMW' AND category = 'MOTOCYKLE'
)
INSERT INTO vehicle_models (brand_id, name, category, series) 
SELECT 
    bmw_moto.id,
    model_name,
    'MOTOCYKLE',
    CASE 
        WHEN model_name LIKE 'R %' THEN 'R Series'
        WHEN model_name LIKE 'S %' THEN 'S Series'
        WHEN model_name LIKE 'F %' THEN 'F Series'
        WHEN model_name LIKE 'K %' THEN 'K Series'
        WHEN model_name LIKE 'G %' THEN 'G Series'
        WHEN model_name LIKE 'C %' THEN 'C Series'
        WHEN model_name LIKE 'CE %' THEN 'CE Series'
        ELSE 'Inne'
    END
FROM bmw_moto,
UNNEST(ARRAY[
    'R 12 nineT', 'R 18', 'R 1250 GS', 'R 1250 RT', 'R 1300 GS', 'R nineT', 'R 1200 GS', 'R 1150 GS',
    'S 1000 RR', 'S 1000 R', 'S 1000 XR', 'S 1000 F',
    'F 900 GS', 'F 900 R', 'F 850 GS', 'F 800 GS', 'F 750 GS', 'F 650 GS',
    'K 1600 GT', 'K 1600 GTL', 'K 1300 S', 'K 1200 RS',
    'G 310 GS', 'G 310 R',
    'C 400 X', 'C 400 GT', 'C 650 GT', 'C 650 Sport',
    'CE 02', 'CE 04'
]) AS model_name
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- 6. Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla tabeli listings
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security) policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownicy mogą widzieć aktywne ogłoszenia
CREATE POLICY "Public can view active listings" ON listings
    FOR SELECT USING (status = 'active');

-- Policy: Użytkownicy mogą edytować swoje ogłoszenia
CREATE POLICY "Users can manage own listings" ON listings
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Użytkownicy mogą widzieć zdjęcia aktywnych ogłoszeń
CREATE POLICY "Public can view listing images" ON listing_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = listing_images.listing_id 
            AND listings.status = 'active'
        )
    );

-- Policy: Użytkownicy mogą zarządzać zdjęciami swoich ogłoszeń
CREATE POLICY "Users can manage own listing images" ON listing_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = listing_images.listing_id 
            AND listings.user_id = auth.uid()
        )
    );

-- 8. Funkcja do wyszukiwania ogłoszeń
CREATE OR REPLACE FUNCTION search_listings(
    search_query TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    brand_filter TEXT DEFAULT NULL,
    year_from INTEGER DEFAULT NULL,
    year_to INTEGER DEFAULT NULL,
    city_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    brand VARCHAR,
    model VARCHAR,
    year INTEGER,
    price DECIMAL,
    currency VARCHAR,
    city VARCHAR,
    primary_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE
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
        l.city,
        (SELECT li.image_url FROM listing_images li 
         WHERE li.listing_id = l.id AND li.is_primary = TRUE 
         LIMIT 1) as primary_image,
        l.created_at
    FROM listings l
    WHERE l.status = 'active'
        AND (search_query IS NULL OR 
             l.title ILIKE '%' || search_query || '%' OR
             l.description ILIKE '%' || search_query || '%' OR
             l.brand ILIKE '%' || search_query || '%' OR
             l.model ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR l.main_category = category_filter)
        AND (min_price IS NULL OR l.price >= min_price)
        AND (max_price IS NULL OR l.price <= max_price)
        AND (brand_filter IS NULL OR l.brand = brand_filter)
        AND (year_from IS NULL OR l.year >= year_from)
        AND (year_to IS NULL OR l.year <= year_to)
        AND (city_filter IS NULL OR l.city ILIKE '%' || city_filter || '%')
    ORDER BY l.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Funkcja do aktualizacji liczby wyświetleń
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE listings 
    SET views = views + 1 
    WHERE id = listing_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Komentarz końcowy
COMMENT ON TABLE listings IS 'Tabela ogłoszeń pojazdów z poprawioną strukturą BMW';
COMMENT ON TABLE listing_images IS 'Zdjęcia ogłoszeń z obsługą asynchronicznego uploadu';
COMMENT ON TABLE vehicle_brands IS 'Marki pojazdów z rozdzieleniem na kategorie';
COMMENT ON TABLE vehicle_models IS 'Modele pojazdów z poprawnym przypisaniem do marek i kategorii';