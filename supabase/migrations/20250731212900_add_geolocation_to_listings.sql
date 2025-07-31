-- Włączenie rozszerzenia PostGIS, jeśli nie jest aktywne
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Dodanie kolumny 'location' do tabeli 'listings' do przechowywania współrzędnych
ALTER TABLE public.listings
ADD COLUMN location geography(Point, 4326);

-- Utworzenie indeksu przestrzennego GIST w celu optymalizacji zapytań
CREATE INDEX listings_location_idx ON public.listings USING GIST (location);

-- Stworzenie funkcji RPC do wyszukiwania ogłoszeń w zadanym promieniu
CREATE OR REPLACE FUNCTION search_listings_by_distance(
    lat float,
    long float,
    radius_km float
)
RETURNS SETOF listings AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.listings
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        radius_km * 1000 -- ST_DWithin dla typu geography oczekuje promienia w metrach
    );
END;
$$ LANGUAGE plpgsql;

-- Funkcja zwracająca tylko ID ogłoszeń w danym promieniu (wydajniejsza do filtrowania)
CREATE OR REPLACE FUNCTION get_listing_ids_in_radius(
    lat float,
    long float,
    radius_km float
)
RETURNS TABLE(id uuid) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id
    FROM public.listings AS l
    WHERE ST_DWithin(
        l.location,
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        radius_km * 1000
    );
END;
$$ LANGUAGE plpgsql;