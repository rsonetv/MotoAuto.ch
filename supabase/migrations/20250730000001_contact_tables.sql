-- Create contact-related tables
-- Author: MotoAuto.ch Team
-- Date: 2025-07-30

-- Create contact_categories table
CREATE TABLE IF NOT EXISTS public.contact_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_en TEXT,
  name_pl TEXT,
  description TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_en TEXT,
  description_pl TEXT,
  icon TEXT,
  email_recipient TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general_inquiry',
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new',
  language TEXT NOT NULL DEFAULT 'de',
  ip_address TEXT,
  user_agent TEXT,
  recaptcha_score FLOAT,
  recaptcha_action TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON public.contact_messages (user_id);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS contact_messages_category_idx ON public.contact_messages (category);
CREATE INDEX IF NOT EXISTS contact_messages_listing_id_idx ON public.contact_messages (listing_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact categories policies (public read, admin write)
CREATE POLICY "Contact categories are viewable by everyone" 
  ON public.contact_categories FOR SELECT USING (true);

CREATE POLICY "Contact categories are insertable by admins only" 
  ON public.contact_categories FOR INSERT WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

CREATE POLICY "Contact categories are updatable by admins only" 
  ON public.contact_categories FOR UPDATE USING (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

CREATE POLICY "Contact categories are deletable by admins only" 
  ON public.contact_categories FOR DELETE USING (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

-- Contact messages policies
CREATE POLICY "Contact messages are viewable by admins and the message sender" 
  ON public.contact_messages FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.admin_users) OR
    auth.uid() = user_id
  );

CREATE POLICY "Contact messages are insertable by everyone" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Contact messages are updatable by admins only" 
  ON public.contact_messages FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Contact messages are deletable by admins only" 
  ON public.contact_messages FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Create trigger for updated_at
CREATE TRIGGER set_contact_categories_updated_at
BEFORE UPDATE ON public.contact_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
