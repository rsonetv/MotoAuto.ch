-- Add contact_messages table to existing MotoAuto.ch database schema
-- Supports contact form functionality with reCAPTCHA integration

-- =========================
-- CONTACT MESSAGES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User information (optional - supports anonymous contact)
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Contact details
    name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone TEXT CHECK (phone IS NULL OR length(phone) >= 10),
    
    -- Message content
    subject TEXT NOT NULL CHECK (length(subject) >= 5 AND length(subject) <= 200),
    message TEXT NOT NULL CHECK (length(message) >= 20 AND length(message) <= 5000),
    category TEXT NOT NULL CHECK (category IN (
        'general_inquiry',
        'listing_inquiry', 
        'technical_support',
        'billing_support',
        'account_issues',
        'partnership',
        'legal_compliance'
    )),
    
    -- Listing-specific contact (optional)
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    
    -- Language and localization
    language TEXT DEFAULT 'de' CHECK (language IN ('de', 'fr', 'pl', 'en')),
    
    -- Status tracking
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Admin assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Response tracking
    response_count INTEGER DEFAULT 0,
    last_response_at TIMESTAMPTZ,
    
    -- Security and spam prevention
    ip_address INET,
    user_agent TEXT,
    recaptcha_score NUMERIC(3,2) CHECK (recaptcha_score >= 0 AND recaptcha_score <= 1),
    recaptcha_action TEXT,
    
    -- Rate limiting tracking
    submission_count INTEGER DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- =========================
-- CONTACT RESPONSES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS contact_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
    
    -- Response details
    responder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    response_text TEXT NOT NULL CHECK (length(response_text) >= 10),
    
    -- Response type
    response_type TEXT DEFAULT 'email' CHECK (response_type IN ('email', 'phone', 'internal_note')),
    
    -- Email tracking
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    email_delivery_status TEXT CHECK (email_delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_listing_id ON contact_messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_priority ON contact_messages(priority);
CREATE INDEX IF NOT EXISTS idx_contact_messages_language ON contact_messages(language);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_address ON contact_messages(ip_address);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_to ON contact_messages(assigned_to);

-- Full-text search index for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_search ON contact_messages 
USING gin(to_tsvector('german', subject || ' ' || message || ' ' || name));

-- Contact responses indexes
CREATE INDEX IF NOT EXISTS idx_contact_responses_message_id ON contact_responses(contact_message_id);
CREATE INDEX IF NOT EXISTS idx_contact_responses_responder_id ON contact_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_contact_responses_created_at ON contact_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_responses_email_status ON contact_responses(email_delivery_status);

-- =========================
-- TRIGGER FUNCTIONS
-- =========================

-- Function to update contact message statistics
CREATE OR REPLACE FUNCTION update_contact_message_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'contact_responses' THEN
        -- Update response count and last response time
        UPDATE contact_messages 
        SET 
            response_count = response_count + 1,
            last_response_at = NOW(),
            status = CASE 
                WHEN status = 'new' THEN 'responded'
                ELSE status
            END,
            responded_at = CASE 
                WHEN responded_at IS NULL THEN NOW()
                ELSE responded_at
            END
        WHERE id = NEW.contact_message_id;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'contact_messages' THEN
        -- Update read timestamp when status changes to read
        IF OLD.status != 'read' AND NEW.status = 'read' AND NEW.read_at IS NULL THEN
            NEW.read_at = NOW();
        END IF;
        
        -- Update closed timestamp when status changes to closed
        IF OLD.status != 'closed' AND NEW.status = 'closed' AND NEW.closed_at IS NULL THEN
            NEW.closed_at = NOW();
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent spam (rate limiting)
CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
    hour_count INTEGER;
BEGIN
    -- Check submissions from same IP in last 5 minutes
    SELECT COUNT(*) INTO recent_count
    FROM contact_messages 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '5 minutes';
    
    IF recent_count >= 3 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another message.';
    END IF;
    
    -- Check submissions from same IP in last hour
    SELECT COUNT(*) INTO hour_count
    FROM contact_messages 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF hour_count >= 10 THEN
        RAISE EXCEPTION 'Hourly rate limit exceeded. Please try again later.';
    END IF;
    
    -- Check submissions from same email in last hour
    SELECT COUNT(*) INTO hour_count
    FROM contact_messages 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF hour_count >= 5 THEN
        RAISE EXCEPTION 'Email rate limit exceeded. Please try again later.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGERS
-- =========================

-- Updated_at triggers
CREATE TRIGGER trg_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contact_responses_updated_at
    BEFORE UPDATE ON contact_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Statistics update triggers
CREATE TRIGGER trg_update_contact_stats
    AFTER INSERT ON contact_responses
    FOR EACH ROW EXECUTE FUNCTION update_contact_message_stats();

CREATE TRIGGER trg_update_contact_status
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_contact_message_stats();

-- Rate limiting trigger
CREATE TRIGGER trg_check_contact_rate_limit
    BEFORE INSERT ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION check_contact_rate_limit();

-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================

-- Enable RLS on contact tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_responses ENABLE ROW LEVEL SECURITY;

-- Contact messages policies
-- Users can see their own messages (if authenticated)
CREATE POLICY "contact_messages_select_own" ON contact_messages
    FOR SELECT USING (
        auth.uid() = user_id OR
        -- Admin users can see all messages (implement admin check as needed)
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (metadata->>'is_admin')::boolean = true
        )
    );

-- Users can insert their own messages
CREATE POLICY "contact_messages_insert_own" ON contact_messages
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL OR auth.uid() = user_id
    );

-- Only admins can update messages
CREATE POLICY "contact_messages_update_admin" ON contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (metadata->>'is_admin')::boolean = true
        )
    );

-- Contact responses policies
-- Users can see responses to their messages
CREATE POLICY "contact_responses_select_relevant" ON contact_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contact_messages 
            WHERE id = contact_responses.contact_message_id 
            AND (user_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM profiles 
                     WHERE id = auth.uid() 
                     AND (metadata->>'is_admin')::boolean = true
                 ))
        )
    );

-- Only admins can insert responses
CREATE POLICY "contact_responses_insert_admin" ON contact_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (metadata->>'is_admin')::boolean = true
        )
    );

-- =========================
-- INITIAL DATA
-- =========================

-- Insert contact categories with multilingual support
-- This will be handled by the API endpoints

COMMIT;