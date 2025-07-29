-- Seed data for contact categories in MotoAuto.ch
-- Author: MotoAuto.ch Team
-- Date: 2025-07-30

-- Insert contact categories if they don't exist
INSERT INTO public.contact_categories (id, slug, name, name_de, name_fr, name_en, name_pl, description, icon, email_recipient, position)
VALUES
  (
    '2f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d2',
    'general_inquiry',
    'Zapytanie ogólne',
    'Allgemeine Anfrage',
    'Demande générale',
    'General Inquiry',
    'Zapytanie ogólne',
    'Pytania ogólne dotyczące platformy MotoAuto.ch',
    'help-circle',
    'kontakt@motoauto.ch',
    1
  ),
  (
    '3f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d3',
    'technical_support',
    'Wsparcie techniczne',
    'Technischer Support',
    'Support technique',
    'Technical Support',
    'Wsparcie techniczne',
    'Problemy techniczne z platformą MotoAuto.ch',
    'tool',
    'support@motoauto.ch',
    2
  ),
  (
    '4f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d4',
    'listing_inquiry',
    'Pytanie o ogłoszenie',
    'Anzeigenanfrage',
    'Demande d''annonce',
    'Listing Inquiry',
    'Pytanie o ogłoszenie',
    'Pytania dotyczące konkretnego ogłoszenia',
    'clipboard',
    'ogloszenia@motoauto.ch',
    3
  ),
  (
    '5f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d5',
    'auction_inquiry',
    'Pytanie o aukcję',
    'Auktionsanfrage',
    'Demande d''enchère',
    'Auction Inquiry',
    'Pytanie o aukcję',
    'Pytania dotyczące konkretnej aukcji',
    'gavel',
    'aukcje@motoauto.ch',
    4
  ),
  (
    '6f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d6',
    'billing_inquiry',
    'Pytanie o płatności',
    'Zahlungsanfrage',
    'Demande de paiement',
    'Billing Inquiry',
    'Pytanie o płatności',
    'Pytania dotyczące płatności, faktur i abonamentów',
    'credit-card',
    'platnosci@motoauto.ch',
    5
  ),
  (
    '7f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d7',
    'dealer_inquiry',
    'Współpraca dla dealerów',
    'Händlerkooperation',
    'Coopération avec les concessionnaires',
    'Dealer Cooperation',
    'Współpraca dla dealerów',
    'Pytania dotyczące współpracy dla dealerów samochodowych',
    'briefcase',
    'dealerzy@motoauto.ch',
    6
  ),
  (
    '8f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d8',
    'partnership',
    'Partnerstwo biznesowe',
    'Geschäftspartnerschaft',
    'Partenariat commercial',
    'Business Partnership',
    'Partnerstwo biznesowe',
    'Propozycje współpracy biznesowej',
    'handshake',
    'biznes@motoauto.ch',
    7
  ),
  (
    '9f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d9',
    'feedback',
    'Opinie i sugestie',
    'Feedback und Vorschläge',
    'Commentaires et suggestions',
    'Feedback and Suggestions',
    'Opinie i sugestie',
    'Opinie i sugestie dotyczące platformy MotoAuto.ch',
    'message-square',
    'feedback@motoauto.ch',
    8
  ),
  (
    'af8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3da',
    'other',
    'Inne',
    'Andere',
    'Autre',
    'Other',
    'Inne',
    'Inne pytania',
    'help-circle',
    'kontakt@motoauto.ch',
    9
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_de = EXCLUDED.name_de,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  name_pl = EXCLUDED.name_pl,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  email_recipient = EXCLUDED.email_recipient,
  position = EXCLUDED.position;
