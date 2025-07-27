-- Account notification email templates for MotoAuto.ch
-- Multi-language support: German (DE), French (FR), Polish (PL), English (EN)

-- Account Welcome Templates
INSERT INTO email_templates (
  name, category, type, language, version,
  subject_template, html_template, text_template,
  description, variables, is_active, is_default,
  test_group, test_percentage
) VALUES 

-- German Welcome Template
(
  'account_welcome_de', 'account', 'account_welcome', 'de', 1,
  'Willkommen bei MotoAuto.ch, {{user.name}}!',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei MotoAuto.ch</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .welcome-message { font-size: 18px; margin-bottom: 0; }
        .content { padding: 0 10px; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .features { display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0; }
        .feature { flex: 1; min-width: 250px; text-align: center; padding: 20px; background: #f8f9ff; border-radius: 8px; }
        .feature-icon { font-size: 40px; margin-bottom: 15px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; transition: background 0.3s; }
        .cta-button:hover { background: #5a67d8; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
        @media (max-width: 600px) {
            .features { flex-direction: column; }
            .feature { min-width: auto; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p class="welcome-message">Willkommen in der Schweizer Fahrzeug-Community!</p>
        </div>
        
        <div class="content">
            <h2>Hallo {{user.name}},</h2>
            
            <p>Herzlich willkommen bei MotoAuto.ch – Ihrem neuen Marktplatz für Fahrzeuge in der Schweiz!</p>
            
            <div class="highlight-box">
                <h3>🎉 Ihr Konto ist bereit!</h3>
                <p>Sie können jetzt Fahrzeuge kaufen, verkaufen und an spannenden Auktionen teilnehmen.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚗</div>
                    <h4>Fahrzeuge inserieren</h4>
                    <p>Verkaufen Sie Ihr Fahrzeug schnell und sicher an interessierte Käufer.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔨</div>
                    <h4>An Auktionen teilnehmen</h4>
                    <p>Bieten Sie mit und sichern Sie sich Ihr Traumfahrzeug zum besten Preis.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <h4>Favoriten verwalten</h4>
                    <p>Speichern Sie interessante Fahrzeuge und verpassen Sie keine Gelegenheit.</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{websiteUrl}}/dashboard" class="cta-button">Jetzt loslegen</a>
            </div>
            
            <div class="highlight-box">
                <h4>💡 Erste Schritte:</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Vervollständigen Sie Ihr Profil für mehr Vertrauen</li>
                    <li>Durchstöbern Sie unsere aktuellen Angebote</li>
                    <li>Folgen Sie interessanten Auktionen</li>
                    <li>Kontaktieren Sie uns bei Fragen</li>
                </ul>
            </div>
            
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung. Kontaktieren Sie uns unter <a href="mailto:support@motoauto.ch">support@motoauto.ch</a> oder besuchen Sie unser <a href="{{websiteUrl}}/hilfe">Hilfe-Center</a>.</p>
            
            <p>Viel Erfolg beim Kaufen und Verkaufen!</p>
            <p><strong>Ihr MotoAuto.ch Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
            </div>
            <p>MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz</p>
            <p>
                <a href="{{websiteUrl}}/datenschutz">Datenschutz</a> | 
                <a href="{{websiteUrl}}/agb">AGB</a> | 
                <a href="{{unsubscribeUrl}}">Abmelden</a>
            </p>
        </div>
    </div>
</body>
</html>',
  'Willkommen bei MotoAuto.ch, {{user.name}}!

Herzlich willkommen bei MotoAuto.ch – Ihrem neuen Marktplatz für Fahrzeuge in der Schweiz!

Ihr Konto ist bereit! Sie können jetzt:
- Fahrzeuge inserieren und verkaufen
- An spannenden Auktionen teilnehmen  
- Favoriten verwalten und Angebote verfolgen

Erste Schritte:
1. Vervollständigen Sie Ihr Profil
2. Durchstöbern Sie unsere Angebote
3. Folgen Sie interessanten Auktionen
4. Kontaktieren Sie uns bei Fragen

Jetzt loslegen: {{websiteUrl}}/dashboard

Bei Fragen: support@motoauto.ch
Hilfe-Center: {{websiteUrl}}/hilfe

Viel Erfolg beim Kaufen und Verkaufen!
Ihr MotoAuto.ch Team

---
MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz
Datenschutz: {{websiteUrl}}/datenschutz | AGB: {{websiteUrl}}/agb
Abmelden: {{unsubscribeUrl}}',
  'Welcome email for new users in German',
  '{"user": {"name": "string", "email": "string"}, "websiteUrl": "string", "unsubscribeUrl": "string"}',
  true, true, 'A', 100
),

-- French Welcome Template
(
  'account_welcome_fr', 'account', 'account_welcome', 'fr', 1,
  'Bienvenue chez MotoAuto.ch, {{user.name}} !',
  '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez MotoAuto.ch</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .welcome-message { font-size: 18px; margin-bottom: 0; }
        .content { padding: 0 10px; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .features { display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0; }
        .feature { flex: 1; min-width: 250px; text-align: center; padding: 20px; background: #f8f9ff; border-radius: 8px; }
        .feature-icon { font-size: 40px; margin-bottom: 15px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; transition: background 0.3s; }
        .cta-button:hover { background: #5a67d8; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
        @media (max-width: 600px) {
            .features { flex-direction: column; }
            .feature { min-width: auto; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p class="welcome-message">Bienvenue dans la communauté automobile suisse !</p>
        </div>
        
        <div class="content">
            <h2>Bonjour {{user.name}},</h2>
            
            <p>Bienvenue chez MotoAuto.ch – votre nouvelle place de marché pour véhicules en Suisse !</p>
            
            <div class="highlight-box">
                <h3>🎉 Votre compte est prêt !</h3>
                <p>Vous pouvez maintenant acheter, vendre des véhicules et participer à des enchères passionnantes.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚗</div>
                    <h4>Publier des véhicules</h4>
                    <p>Vendez votre véhicule rapidement et en toute sécurité à des acheteurs intéressés.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔨</div>
                    <h4>Participer aux enchères</h4>
                    <p>Enchérissez et obtenez le véhicule de vos rêves au meilleur prix.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <h4>Gérer les favoris</h4>
                    <p>Sauvegardez les véhicules intéressants et ne manquez aucune opportunité.</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{websiteUrl}}/dashboard" class="cta-button">Commencer maintenant</a>
            </div>
            
            <div class="highlight-box">
                <h4>💡 Premiers pas :</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Complétez votre profil pour plus de confiance</li>
                    <li>Parcourez nos offres actuelles</li>
                    <li>Suivez les enchères intéressantes</li>
                    <li>Contactez-nous pour toute question</li>
                </ul>
            </div>
            
            <p>Pour toute question, nous sommes à votre disposition. Contactez-nous à <a href="mailto:support@motoauto.ch">support@motoauto.ch</a> ou visitez notre <a href="{{websiteUrl}}/aide">centre d''aide</a>.</p>
            
            <p>Bonne chance pour vos achats et ventes !</p>
            <p><strong>Votre équipe MotoAuto.ch</strong></p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
            </div>
            <p>MotoAuto.ch - Votre place de marché pour véhicules en Suisse</p>
            <p>
                <a href="{{websiteUrl}}/confidentialite">Confidentialité</a> | 
                <a href="{{websiteUrl}}/cgu">CGU</a> | 
                <a href="{{unsubscribeUrl}}">Se désabonner</a>
            </p>
        </div>
    </div>
</body>
</html>',
  'Bienvenue chez MotoAuto.ch, {{user.name}} !

Bienvenue chez MotoAuto.ch – votre nouvelle place de marché pour véhicules en Suisse !

Votre compte est prêt ! Vous pouvez maintenant :
- Publier et vendre des véhicules
- Participer à des enchères passionnantes
- Gérer vos favoris et suivre les offres

Premiers pas :
1. Complétez votre profil
2. Parcourez nos offres
3. Suivez les enchères intéressantes
4. Contactez-nous pour toute question

Commencer maintenant : {{websiteUrl}}/dashboard

Pour toute question : support@motoauto.ch
Centre d''aide : {{websiteUrl}}/aide

Bonne chance pour vos achats et ventes !
Votre équipe MotoAuto.ch

---
MotoAuto.ch - Votre place de marché pour véhicules en Suisse
Confidentialité : {{websiteUrl}}/confidentialite | CGU : {{websiteUrl}}/cgu
Se désabonner : {{unsubscribeUrl}}',
  'Welcome email for new users in French',
  '{"user": {"name": "string", "email": "string"}, "websiteUrl": "string", "unsubscribeUrl": "string"}',
  true, true, 'A', 100
);

-- Account Verification Templates
INSERT INTO email_templates (
  name, category, type, language, version,
  subject_template, html_template, text_template,
  description, variables, is_active, is_default,
  test_group, test_percentage
) VALUES 

-- German Verification Template
(
  'account_verification_de', 'account', 'account_verification', 'de', 1,
  'E-Mail-Adresse bestätigen - MotoAuto.ch',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Mail-Adresse bestätigen</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 0 10px; }
        .verification-box { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center; }
        .verify-button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 15px 0; transition: background 0.3s; }
        .verify-button:hover { background: #0284c7; }
        .security-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p>E-Mail-Adresse bestätigen</p>
        </div>
        
        <div class="content">
            <h2>Hallo {{user.name}},</h2>
            
            <p>vielen Dank für Ihre Registrierung bei MotoAuto.ch! Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.</p>
            
            <div class="verification-box">
                <h3>🔐 Bestätigung erforderlich</h3>
                <p>Klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu bestätigen:</p>
                <a href="{{verificationUrl}}" class="verify-button">E-Mail-Adresse bestätigen</a>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                    Dieser Link ist 24 Stunden gültig.
                </p>
            </div>
            
            <div class="security-note">
                <h4>🛡️ Sicherheitshinweis</h4>
                <p>Falls Sie sich nicht bei MotoAuto.ch registriert haben, ignorieren Sie diese E-Mail. Ihr Konto wird nicht aktiviert, ohne dass Sie auf den Bestätigungslink klicken.</p>
            </div>
            
            <p><strong>Warum bestätigen wir E-Mail-Adressen?</strong></p>
            <ul>
                <li>Schutz vor unbefugtem Zugriff</li>
                <li>Sicherstellung wichtiger Benachrichtigungen</li>
                <li>Vertrauen in unserer Community</li>
            </ul>
            
            <p>Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">{{verificationUrl}}</p>
            
            <p>Bei Problemen kontaktieren Sie uns unter <a href="mailto:support@motoauto.ch">support@motoauto.ch</a>.</p>
            
            <p><strong>Ihr MotoAuto.ch Team</strong></p>
        </div>
        
        <div class="footer">
            <p>MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz</p>
            <p>
                <a href="{{websiteUrl}}/datenschutz">Datenschutz</a> | 
                <a href="{{websiteUrl}}/agb">AGB</a>
            </p>
        </div>
    </div>
</body>
</html>',
  'E-Mail-Adresse bestätigen - MotoAuto.ch

Hallo {{user.name}},

vielen Dank für Ihre Registrierung bei MotoAuto.ch! Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.

Bestätigung erforderlich:
Klicken Sie auf diesen Link: {{verificationUrl}}
(Gültig für 24 Stunden)

Sicherheitshinweis:
Falls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.

Warum bestätigen wir E-Mail-Adressen?
- Schutz vor unbefugtem Zugriff
- Sicherstellung wichtiger Benachrichtigungen  
- Vertrauen in unserer Community

Bei Problemen: support@motoauto.ch

Ihr MotoAuto.ch Team

---
MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz
Datenschutz: {{websiteUrl}}/datenschutz | AGB: {{websiteUrl}}/agb',
  'Email verification template in German',
  '{"user": {"name": "string", "email": "string"}, "verificationUrl": "string", "websiteUrl": "string"}',
  true, true, 'A', 100
);

-- Password Reset Templates
INSERT INTO email_templates (
  name, category, type, language, version,
  subject_template, html_template, text_template,
  description, variables, is_active, is_default,
  test_group, test_percentage
) VALUES 

-- German Password Reset Template
(
  'account_password_reset_de', 'account', 'account_password_reset', 'de', 1,
  'Passwort zurücksetzen - MotoAuto.ch',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passwort zurücksetzen</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 0 10px; }
        .reset-box { background: #fef2f2; border: 2px solid #dc2626; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center; }
        .reset-button { display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 15px 0; transition: background 0.3s; }
        .reset-button:hover { background: #b91c1c; }
        .security-warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p>🔐 Passwort zurücksetzen</p>
        </div>
        
        <div class="content">
            <h2>Hallo {{user.name}},</h2>
            
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr MotoAuto.ch-Konto gestellt.</p>
            
            <div class="reset-box">
                <h3>🔑 Neues Passwort erstellen</h3>
                <p>Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen:</p>
                <a href="{{resetUrl}}" class="reset-button">Passwort zurücksetzen</a>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                    Dieser Link ist 1 Stunde gültig.
                </p>
            </div>
            
            <div class="security-warning">
                <h4>⚠️ Wichtiger Sicherheitshinweis</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail</li>
                    <li>Ihr aktuelles Passwort bleibt unverändert</li>
                    <li>Teilen Sie diesen Link niemals mit anderen</li>
                    <li>Der Link funktioniert nur einmal</li>
                </ul>
            </div>
            
            <p><strong>Verdächtige Aktivität?</strong></p>
            <p>Falls Sie diese Anfrage nicht gestellt haben, könnte jemand versuchen, auf Ihr Konto zuzugreifen. Kontaktieren Sie uns sofort unter <a href="mailto:security@motoauto.ch">security@motoauto.ch</a>.</p>
            
            <p>Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">{{resetUrl}}</p>
            
            <p><strong>Ihr MotoAuto.ch Team</strong></p>
        </div>
        
        <div class="footer">
            <p>MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz</p>
            <p>
                <a href="{{websiteUrl}}/datenschutz">Datenschutz</a> | 
                <a href="{{websiteUrl}}/agb">AGB</a> | 
                <a href="{{websiteUrl}}/sicherheit">Sicherheit</a>
            </p>
        </div>
    </div>
</body>
</html>',
  'Passwort zurücksetzen - MotoAuto.ch

Hallo {{user.name}},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.

Neues Passwort erstellen:
{{resetUrl}}
(Gültig für 1 Stunde)

Wichtiger Sicherheitshinweis:
- Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail
- Ihr aktuelles Passwort bleibt unverändert
- Teilen Sie diesen Link niemals mit anderen
- Der Link funktioniert nur einmal

Verdächtige Aktivität?
Falls Sie diese Anfrage nicht gestellt haben, kontaktieren Sie uns sofort:
security@motoauto.ch

Ihr MotoAuto.ch Team

---
MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz
Datenschutz: {{websiteUrl}}/datenschutz | AGB: {{websiteUrl}}/agb',
  'Password reset template in German',
  '{"user": {"name": "string", "email": "string"}, "resetUrl": "string", "websiteUrl": "string"}',
  true, true, 'A', 100
);