-- Przełączenie na odpowiednią rolę (jeśli potrzebne)
SET LOCAL ROLE postgres;

-- Utworzenie tabeli notes
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wstawienie przykładowych danych
INSERT INTO public.notes (title, content) VALUES
    ('Today I created a Supabase project.', 'Setting up the database was easier than expected!'),
    ('I added some data and queried it from Next.js.', 'The integration works perfectly with App Router.'),
    ('It was awesome!', 'Ready to build the MotoAuto.ch platform.'),
    ('MotoAuto.ch Development Started', 'Beginning development of the Swiss vehicle marketplace platform.'),
    ('Database Schema Planning', 'Planning the database structure for vehicles, users, and auctions.'),
    ('Authentication System', 'Implementing secure user authentication with Supabase Auth.')
ON CONFLICT DO NOTHING;

-- Włączenie RLS (Row Level Security)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy dla publicznego dostępu do odczytu
CREATE POLICY IF NOT EXISTS "public can read notes"
    ON public.notes
    FOR SELECT
    TO anon
    USING (true);

-- Policy dla uwierzytelnionych użytkowników
CREATE POLICY IF NOT EXISTS "authenticated can manage notes"
    ON public.notes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Index dla wydajności
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- Trigger dla automatycznego update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON public.notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Powrót do domyślnej roli
RESET ROLE;
