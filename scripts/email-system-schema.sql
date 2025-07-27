-- Email System Database Schema for MotoAuto.ch
-- This script adds comprehensive email notification system tables

-- Email preferences for users
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification categories
    auction_notifications BOOLEAN DEFAULT true,
    outbid_notifications BOOLEAN DEFAULT true,
    auction_ending_notifications BOOLEAN DEFAULT true,
    auction_won_notifications BOOLEAN DEFAULT true,
    auction_extended_notifications BOOLEAN DEFAULT true,
    
    watchlist_notifications BOOLEAN DEFAULT true,
    watchlist_updates BOOLEAN DEFAULT true,
    watchlist_ending_soon BOOLEAN DEFAULT true,
    
    account_notifications BOOLEAN DEFAULT true,
    registration_confirmations BOOLEAN DEFAULT true,
    password_reset_notifications BOOLEAN DEFAULT true,
    profile_update_notifications BOOLEAN DEFAULT true,
    security_notifications BOOLEAN DEFAULT true,
    
    payment_notifications BOOLEAN DEFAULT true,
    payment_confirmations BOOLEAN DEFAULT true,
    invoice_notifications BOOLEAN DEFAULT true,
    refund_notifications BOOLEAN DEFAULT true,
    commission_notifications BOOLEAN DEFAULT true,
    
    contact_notifications BOOLEAN DEFAULT true,
    contact_confirmations BOOLEAN DEFAULT true,
    contact_responses BOOLEAN DEFAULT true,
    listing_inquiries BOOLEAN DEFAULT true,
    
    marketing_notifications BOOLEAN DEFAULT false,
    newsletter_subscription BOOLEAN DEFAULT false,
    promotional_emails BOOLEAN DEFAULT false,
    feature_announcements BOOLEAN DEFAULT true,
    
    -- Frequency settings
    notification_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'disabled')),
    digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly', 'disabled')),
    
    -- Language and format preferences
    preferred_language VARCHAR(5) DEFAULT 'de' CHECK (preferred_language IN ('de', 'fr', 'pl', 'en')),
    email_format VARCHAR(10) DEFAULT 'html' CHECK (email_format IN ('html', 'text', 'both')),
    
    -- Unsubscribe management
    unsubscribe_token UUID UNIQUE DEFAULT gen_random_uuid(),
    is_unsubscribed BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_reason TEXT,
    
    -- Swiss compliance
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_ip_address INET,
    data_retention_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email queue for reliable delivery
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient information
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    reply_to VARCHAR(255),
    
    -- Email content
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    template_name VARCHAR(100),
    template_data JSONB,
    
    -- Email metadata
    email_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(5) DEFAULT 'de',
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    
    -- Related entities
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    contact_message_id UUID REFERENCES contact_messages(id) ON DELETE SET NULL,
    
    -- Queue management
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Provider information
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    provider_response JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email delivery tracking
CREATE TABLE IF NOT EXISTS email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_queue_id UUID NOT NULL REFERENCES email_queue(id) ON DELETE CASCADE,
    
    -- Event tracking
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Event details
    ip_address INET,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    
    -- Link tracking (for clicks)
    clicked_url TEXT,
    link_id VARCHAR(100),
    
    -- Bounce/complaint details
    bounce_type VARCHAR(50),
    bounce_reason TEXT,
    complaint_type VARCHAR(50),
    
    -- Provider data
    provider_event_id VARCHAR(255),
    provider_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates storage
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template identification
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    language VARCHAR(5) NOT NULL CHECK (language IN ('de', 'fr', 'pl', 'en')),
    version INTEGER DEFAULT 1,
    
    -- Template content
    subject_template TEXT NOT NULL,
    html_template TEXT,
    text_template TEXT,
    
    -- Template metadata
    description TEXT,
    variables JSONB, -- JSON schema of expected variables
    
    -- Status and versioning
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- A/B testing
    test_group VARCHAR(50),
    test_percentage INTEGER DEFAULT 100 CHECK (test_percentage BETWEEN 0 AND 100),
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique active template per type/language
    UNIQUE(name, language, version)
);

-- Email campaigns for marketing
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campaign details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('newsletter', 'promotional', 'announcement', 'transactional')),
    
    -- Targeting
    target_audience JSONB, -- Criteria for recipient selection
    languages VARCHAR(20)[] DEFAULT ARRAY['de'], -- Target languages
    
    -- Content
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    subject VARCHAR(500) NOT NULL,
    content_data JSONB,
    
    -- Scheduling
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    emails_bounced INTEGER DEFAULT 0,
    emails_complained INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    
    -- Swiss compliance
    gdpr_compliant BOOLEAN DEFAULT true,
    consent_required BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 1095, -- 3 years
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unsubscribe tracking
CREATE TABLE IF NOT EXISTS email_unsubscribes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User information
    email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Unsubscribe details
    unsubscribe_token UUID NOT NULL,
    unsubscribe_type VARCHAR(50) NOT NULL CHECK (unsubscribe_type IN ('all', 'category', 'campaign')),
    category VARCHAR(50), -- Specific category if type is 'category'
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    
    -- Reason and feedback
    reason VARCHAR(100),
    feedback TEXT,
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Resubscribe tracking
    is_resubscribed BOOLEAN DEFAULT false,
    resubscribed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribe_token ON email_preferences(unsubscribe_token);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type ON email_queue(email_type);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC);

CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_queue_id ON email_delivery_logs(email_queue_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_event_type ON email_delivery_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_timestamp ON email_delivery_logs(event_timestamp);

CREATE INDEX IF NOT EXISTS idx_email_templates_name_language ON email_templates(name, language);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_token ON email_unsubscribes(unsubscribe_token);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for email management
CREATE OR REPLACE FUNCTION get_user_email_preferences(p_user_id UUID)
RETURNS TABLE (
    preference_name TEXT,
    preference_value BOOLEAN,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'auction_notifications'::TEXT, auction_notifications, 'auction'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'outbid_notifications'::TEXT, outbid_notifications, 'auction'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'auction_ending_notifications'::TEXT, auction_ending_notifications, 'auction'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'auction_won_notifications'::TEXT, auction_won_notifications, 'auction'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'watchlist_notifications'::TEXT, watchlist_notifications, 'watchlist'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'account_notifications'::TEXT, account_notifications, 'account'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'payment_notifications'::TEXT, payment_notifications, 'payment'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'contact_notifications'::TEXT, contact_notifications, 'contact'::TEXT FROM email_preferences WHERE user_id = p_user_id
    UNION ALL
    SELECT 'marketing_notifications'::TEXT, marketing_notifications, 'marketing'::TEXT FROM email_preferences WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can receive email type
CREATE OR REPLACE FUNCTION can_send_email(p_user_id UUID, p_email_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    preferences RECORD;
    can_send BOOLEAN := false;
BEGIN
    SELECT * INTO preferences FROM email_preferences WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- If no preferences found, create default preferences
        INSERT INTO email_preferences (user_id) VALUES (p_user_id);
        RETURN true;
    END IF;
    
    -- Check if user is unsubscribed
    IF preferences.is_unsubscribed THEN
        RETURN false;
    END IF;
    
    -- Check specific email type permissions
    CASE p_email_type
        WHEN 'auction_outbid' THEN can_send := preferences.auction_notifications AND preferences.outbid_notifications;
        WHEN 'auction_ending' THEN can_send := preferences.auction_notifications AND preferences.auction_ending_notifications;
        WHEN 'auction_won' THEN can_send := preferences.auction_notifications AND preferences.auction_won_notifications;
        WHEN 'auction_extended' THEN can_send := preferences.auction_notifications AND preferences.auction_extended_notifications;
        WHEN 'watchlist_update' THEN can_send := preferences.watchlist_notifications AND preferences.watchlist_updates;
        WHEN 'watchlist_ending' THEN can_send := preferences.watchlist_notifications AND preferences.watchlist_ending_soon;
        WHEN 'account_welcome' THEN can_send := preferences.account_notifications AND preferences.registration_confirmations;
        WHEN 'account_password_reset' THEN can_send := preferences.account_notifications AND preferences.password_reset_notifications;
        WHEN 'account_profile_update' THEN can_send := preferences.account_notifications AND preferences.profile_update_notifications;
        WHEN 'payment_confirmation' THEN can_send := preferences.payment_notifications AND preferences.payment_confirmations;
        WHEN 'payment_invoice' THEN can_send := preferences.payment_notifications AND preferences.invoice_notifications;
        WHEN 'payment_refund' THEN can_send := preferences.payment_notifications AND preferences.refund_notifications;
        WHEN 'contact_confirmation' THEN can_send := preferences.contact_notifications AND preferences.contact_confirmations;
        WHEN 'contact_response' THEN can_send := preferences.contact_notifications AND preferences.contact_responses;
        WHEN 'listing_inquiry' THEN can_send := preferences.contact_notifications AND preferences.listing_inquiries;
        WHEN 'newsletter' THEN can_send := preferences.marketing_notifications AND preferences.newsletter_subscription;
        WHEN 'promotional' THEN can_send := preferences.marketing_notifications AND preferences.promotional_emails;
        WHEN 'announcement' THEN can_send := preferences.marketing_notifications AND preferences.feature_announcements;
        ELSE can_send := true; -- Default to true for unknown types
    END CASE;
    
    RETURN can_send;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Email preferences policies
CREATE POLICY "Users can view own email preferences" ON email_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own email preferences" ON email_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email preferences" ON email_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email queue policies (admin only for security)
CREATE POLICY "Service role can manage email queue" ON email_queue FOR ALL USING (auth.role() = 'service_role');

-- Email templates policies (admin only)
CREATE POLICY "Service role can manage email templates" ON email_templates FOR ALL USING (auth.role() = 'service_role');

-- Email campaigns policies (admin only)
CREATE POLICY "Service role can manage email campaigns" ON email_campaigns FOR ALL USING (auth.role() = 'service_role');

-- Delivery logs policies (admin only)
CREATE POLICY "Service role can view delivery logs" ON email_delivery_logs FOR SELECT USING (auth.role() = 'service_role');

-- Unsubscribe policies (public for unsubscribe links)
CREATE POLICY "Anyone can insert unsubscribe records" ON email_unsubscribes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can view unsubscribe records" ON email_unsubscribes FOR SELECT USING (auth.role() = 'service_role');

-- Insert default email templates
INSERT INTO email_templates (name, category, type, language, subject_template, html_template, text_template, description, variables) VALUES
-- Auction templates
('auction_outbid', 'auction', 'transactional', 'de', 'Sie wurden überboten - {{listing.title}}', 
 '<h2>Sie wurden überboten</h2><p>Hallo {{user.name}},</p><p>leider wurden Sie bei der Auktion für <strong>{{listing.title}}</strong> überboten.</p><p>Aktuelles Gebot: {{auction.currentBid}} {{listing.currency}}</p><p><a href="{{listing.url}}">Jetzt mitbieten</a></p>',
 'Sie wurden überboten\n\nHallo {{user.name}},\n\nleider wurden Sie bei der Auktion für {{listing.title}} überboten.\n\nAktuelles Gebot: {{auction.currentBid}} {{listing.currency}}\n\nJetzt mitbieten: {{listing.url}}',
 'Notification when user is outbid in auction',
 '{"user": {"name": "string"}, "listing": {"title": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number"}}'),

('auction_ending_soon', 'auction', 'transactional', 'de', 'Auktion endet bald - {{listing.title}}',
 '<h2>Auktion endet bald</h2><p>Hallo {{user.name}},</p><p>die Auktion für <strong>{{listing.title}}</strong> endet in {{timeRemaining}}.</p><p>Aktuelles Gebot: {{auction.currentBid}} {{listing.currency}}</p><p><a href="{{listing.url}}">Jetzt mitbieten</a></p>',
 'Auktion endet bald\n\nHallo {{user.name}},\n\ndie Auktion für {{listing.title}} endet in {{timeRemaining}}.\n\nAktuelles Gebot: {{auction.currentBid}} {{listing.currency}}\n\nJetzt mitbieten: {{listing.url}}',
 'Notification when auction is ending soon',
 '{"user": {"name": "string"}, "listing": {"title": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number"}, "timeRemaining": "string"}'),

-- Account templates  
('account_welcome', 'account', 'transactional', 'de', 'Willkommen bei MotoAuto.ch',
 '<h2>Willkommen bei MotoAuto.ch</h2><p>Hallo {{user.name}},</p><p>vielen Dank für Ihre Registrierung bei MotoAuto.ch, dem führenden Automobilmarktplatz der Schweiz.</p><p><a href="{{verificationUrl}}">E-Mail-Adresse bestätigen</a></p>',
 'Willkommen bei MotoAuto.ch\n\nHallo {{user.name}},\n\nvielen Dank für Ihre Registrierung bei MotoAuto.ch, dem führenden Automobilmarktplatz der Schweiz.\n\nE-Mail-Adresse bestätigen: {{verificationUrl}}',
 'Welcome email for new users',
 '{"user": {"name": "string"}, "verificationUrl": "string"}'),

-- Payment templates
('payment_confirmation', 'payment', 'transactional', 'de', 'Zahlungsbestätigung - {{payment.description}}',
 '<h2>Zahlungsbestätigung</h2><p>Hallo {{user.name}},</p><p>Ihre Zahlung über {{payment.amount}} {{payment.currency}} wurde erfolgreich verarbeitet.</p><p>Transaktions-ID: {{payment.id}}</p>',
 'Zahlungsbestätigung\n\nHallo {{user.name}},\n\nIhre Zahlung über {{payment.amount}} {{payment.currency}} wurde erfolgreich verarbeitet.\n\nTransaktions-ID: {{payment.id}}',
 'Payment confirmation email',
 '{"user": {"name": "string"}, "payment": {"amount": "number", "currency": "string", "id": "string", "description": "string"}}')

ON CONFLICT (name, language, version) DO NOTHING;

-- Create default email preferences for existing users
INSERT INTO email_preferences (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM email_preferences)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE email_preferences IS 'User email notification preferences with Swiss compliance features';
COMMENT ON TABLE email_queue IS 'Email queue for reliable delivery with comprehensive tracking';
COMMENT ON TABLE email_delivery_logs IS 'Detailed email delivery and engagement tracking';
COMMENT ON TABLE email_templates IS 'Multi-language email templates with versioning';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns with Swiss compliance';
COMMENT ON TABLE email_unsubscribes IS 'Unsubscribe tracking and management';