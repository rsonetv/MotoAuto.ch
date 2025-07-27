-- Payment notification email templates for MotoAuto.ch
-- Multi-language support: German (DE), French (FR), Polish (PL), English (EN)

-- Payment Confirmation Templates
INSERT INTO email_templates (
  name, category, type, language, version,
  subject_template, html_template, text_template,
  description, variables, is_active, is_default,
  test_group, test_percentage
) VALUES 

-- German Payment Confirmation Template
(
  'payment_confirmation_de', 'payment', 'payment_confirmation', 'de', 1,
  'Zahlungsbestätigung - {{payment.description}} ({{payment.amount}} {{payment.currency}})',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zahlungsbestätigung</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 0 10px; }
        .success-box { background: #f0fdf4; border: 2px solid #10b981; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center; }
        .success-icon { font-size: 60px; color: #10b981; margin-bottom: 15px; }
        .payment-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .amount-highlight { font-size: 24px; font-weight: bold; color: #10b981; }
        .next-steps { background: #e7f3ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
        .button:hover { background: #5a67d8; }
        @media (max-width: 600px) {
            .detail-row { flex-direction: column; }
            .detail-label { margin-bottom: 5px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p>✅ Zahlung erfolgreich</p>
        </div>
        
        <div class="content">
            <div class="success-box">
                <div class="success-icon">✅</div>
                <h2>Zahlung bestätigt!</h2>
                <p>Ihre Zahlung wurde erfolgreich verarbeitet.</p>
                <div class="amount-highlight">{{payment.amount}} {{payment.currency}}</div>
            </div>
            
            <h3>Zahlungsdetails</h3>
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">Transaktions-ID:</span>
                    <span class="detail-value">{{payment.id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Beschreibung:</span>
                    <span class="detail-value">{{payment.description}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Betrag:</span>
                    <span class="detail-value">{{payment.amount}} {{payment.currency}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Zahlungsmethode:</span>
                    <span class="detail-value">{{payment.method}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">{{payment.status}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Datum:</span>
                    <span class="detail-value">{{formatDate payment.created_at}}</span>
                </div>
            </div>
            
            {{#if listing}}
            <div class="next-steps">
                <h4>🚗 Fahrzeug-Details</h4>
                <p><strong>{{listing.brand}} {{listing.model}}</strong> ({{listing.year}})</p>
                <p>Listing-ID: {{listing.id}}</p>
                <div style="text-align: center; margin-top: 15px;">
                    <a href="{{listing.url}}" class="button">Fahrzeug ansehen</a>
                </div>
            </div>
            {{/if}}
            
            {{#if auction}}
            <div class="next-steps">
                <h4>🔨 Auktions-Details</h4>
                <p>Auktions-ID: {{auction.id}}</p>
                {{#if auction.winningBid}}
                <p>Gewinngebot: {{auction.winningBid}} {{payment.currency}}</p>
                {{/if}}
                <div style="text-align: center; margin-top: 15px;">
                    <a href="{{websiteUrl}}/auktionen/{{auction.id}}" class="button">Auktion ansehen</a>
                </div>
            </div>
            {{/if}}
            
            <div class="next-steps">
                <h4>📋 Nächste Schritte</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Eine Rechnung wird Ihnen separat zugesendet</li>
                    <li>Bei Auktionsgewinn erhalten Sie weitere Anweisungen</li>
                    <li>Kontaktieren Sie den Verkäufer für die Abwicklung</li>
                    <li>Bewerten Sie Ihre Erfahrung nach dem Kauf</li>
                </ul>
            </div>
            
            <p>Bei Fragen zu Ihrer Zahlung kontaktieren Sie uns unter <a href="mailto:billing@motoauto.ch">billing@motoauto.ch</a> oder besuchen Sie unser <a href="{{websiteUrl}}/hilfe/zahlungen">Zahlungs-Hilfe-Center</a>.</p>
            
            <p>Vielen Dank für Ihr Vertrauen!</p>
            <p><strong>Ihr MotoAuto.ch Team</strong></p>
        </div>
        
        <div class="footer">
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
  'Zahlungsbestätigung - {{payment.description}} ({{payment.amount}} {{payment.currency}})

✅ Zahlung erfolgreich!

Ihre Zahlung wurde erfolgreich verarbeitet.
Betrag: {{payment.amount}} {{payment.currency}}

Zahlungsdetails:
- Transaktions-ID: {{payment.id}}
- Beschreibung: {{payment.description}}
- Zahlungsmethode: {{payment.method}}
- Status: {{payment.status}}
- Datum: {{formatDate payment.created_at}}

{{#if listing}}
Fahrzeug-Details:
{{listing.brand}} {{listing.model}} ({{listing.year}})
Listing-ID: {{listing.id}}
Ansehen: {{listing.url}}
{{/if}}

{{#if auction}}
Auktions-Details:
Auktions-ID: {{auction.id}}
{{#if auction.winningBid}}Gewinngebot: {{auction.winningBid}} {{payment.currency}}{{/if}}
{{/if}}

Nächste Schritte:
- Eine Rechnung wird Ihnen separat zugesendet
- Bei Auktionsgewinn erhalten Sie weitere Anweisungen
- Kontaktieren Sie den Verkäufer für die Abwicklung
- Bewerten Sie Ihre Erfahrung nach dem Kauf

Bei Fragen: billing@motoauto.ch
Zahlungs-Hilfe: {{websiteUrl}}/hilfe/zahlungen

Vielen Dank für Ihr Vertrauen!
Ihr MotoAuto.ch Team

---
MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz
Datenschutz: {{websiteUrl}}/datenschutz | AGB: {{websiteUrl}}/agb
Abmelden: {{unsubscribeUrl}}',
  'Payment confirmation template in German',
  '{"user": {"name": "string"}, "payment": {"id": "string", "amount": "number", "currency": "string", "description": "string", "method": "string", "status": "string", "created_at": "string"}, "listing": {"id": "string", "brand": "string", "model": "string", "year": "number", "url": "string"}, "auction": {"id": "string", "winningBid": "number"}, "websiteUrl": "string", "unsubscribeUrl": "string"}',
  true, true, 'A', 100
),

-- Payment Invoice Template
(
  'payment_invoice_de', 'payment', 'payment_invoice', 'de', 1,
  'Rechnung {{invoice.number}} - MotoAuto.ch',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechnung</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 0 10px; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
        .invoice-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; background: #e7f3ff; margin: 10px -20px -20px -20px; padding: 15px 20px; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .company-info { text-align: left; }
        .invoice-info { text-align: right; }
        .tax-info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .download-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
        .download-button:hover { background: #218838; }
        @media (max-width: 600px) {
            .invoice-header { flex-direction: column; }
            .invoice-info { text-align: left; margin-top: 20px; }
            .detail-row { flex-direction: column; }
            .detail-label { margin-bottom: 5px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p>📄 Rechnung</p>
        </div>
        
        <div class="content">
            <div class="invoice-header">
                <div class="company-info">
                    <h3>MotoAuto.ch</h3>
                    <p>
                        Musterstrasse 123<br>
                        8000 Zürich<br>
                        Schweiz<br>
                        <br>
                        Tel: +41 44 123 45 67<br>
                        E-Mail: billing@motoauto.ch<br>
                        Web: www.motoauto.ch
                    </p>
                </div>
                <div class="invoice-info">
                    <h3>Rechnung an:</h3>
                    <p>
                        {{user.name}}<br>
                        {{user.email}}<br>
                        <br>
                        <strong>Rechnungsnummer:</strong> {{invoice.number}}<br>
                        <strong>Rechnungsdatum:</strong> {{formatDate invoice.date}}<br>
                        <strong>Fälligkeitsdatum:</strong> {{formatDate invoice.dueDate}}
                    </p>
                </div>
            </div>
            
            <h3>Rechnungsdetails</h3>
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Beschreibung:</span>
                    <span class="detail-value">{{payment.description}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaktions-ID:</span>
                    <span class="detail-value">{{payment.id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Zahlungsdatum:</span>
                    <span class="detail-value">{{formatDate payment.created_at}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nettobetrag:</span>
                    <span class="detail-value">{{payment.netAmount}} {{payment.currency}}</span>
                </div>
                {{#if payment.vatAmount}}
                <div class="detail-row">
                    <span class="detail-label">MwSt. ({{payment.vatRate}}%):</span>
                    <span class="detail-value">{{payment.vatAmount}} {{payment.currency}}</span>
                </div>
                {{/if}}
                <div class="detail-row">
                    <span class="detail-label">Gesamtbetrag:</span>
                    <span class="detail-value">{{payment.amount}} {{payment.currency}}</span>
                </div>
            </div>
            
            {{#if payment.vatAmount}}
            <div class="tax-info">
                <h4>🏛️ Steuerliche Hinweise</h4>
                <p>Diese Rechnung enthält Schweizer Mehrwertsteuer (MwSt.) in Höhe von {{payment.vatRate}}%. Unsere MwSt.-Nummer: CHE-123.456.789 MWST</p>
            </div>
            {{/if}}
            
            {{#if listing}}
            <h4>🚗 Fahrzeug-Informationen</h4>
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Fahrzeug:</span>
                    <span class="detail-value">{{listing.brand}} {{listing.model}} ({{listing.year}})</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Listing-ID:</span>
                    <span class="detail-value">{{listing.id}}</span>
                </div>
                {{#if listing.price}}
                <div class="detail-row">
                    <span class="detail-label">Fahrzeugpreis:</span>
                    <span class="detail-value">{{listing.price}} {{listing.currency}}</span>
                </div>
                {{/if}}
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{invoiceUrl}}" class="download-button">📄 Rechnung als PDF herunterladen</a>
            </div>
            
            <div class="tax-info">
                <h4>💡 Wichtige Informationen</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Diese Rechnung wurde automatisch erstellt und ist ohne Unterschrift gültig</li>
                    <li>Bewahren Sie diese Rechnung für Ihre Unterlagen auf</li>
                    <li>Bei Fragen kontaktieren Sie unsere Buchhaltung</li>
                    <li>Zahlungsziel: 30 Tage netto</li>
                </ul>
            </div>
            
            <p>Bei Fragen zu dieser Rechnung kontaktieren Sie uns unter <a href="mailto:billing@motoauto.ch">billing@motoauto.ch</a>.</p>
            
            <p>Vielen Dank für Ihr Vertrauen!</p>
            <p><strong>Ihr MotoAuto.ch Team</strong></p>
        </div>
        
        <div class="footer">
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
  'Rechnung {{invoice.number}} - MotoAuto.ch

📄 RECHNUNG

Von: MotoAuto.ch
Musterstrasse 123, 8000 Zürich, Schweiz
Tel: +41 44 123 45 67
E-Mail: billing@motoauto.ch

An: {{user.name}}
E-Mail: {{user.email}}

Rechnungsnummer: {{invoice.number}}
Rechnungsdatum: {{formatDate invoice.date}}
Fälligkeitsdatum: {{formatDate invoice.dueDate}}

RECHNUNGSDETAILS:
- Beschreibung: {{payment.description}}
- Transaktions-ID: {{payment.id}}
- Zahlungsdatum: {{formatDate payment.created_at}}
- Nettobetrag: {{payment.netAmount}} {{payment.currency}}
{{#if payment.vatAmount}}- MwSt. ({{payment.vatRate}}%): {{payment.vatAmount}} {{payment.currency}}{{/if}}
- GESAMTBETRAG: {{payment.amount}} {{payment.currency}}

{{#if payment.vatAmount}}
Steuerliche Hinweise:
Diese Rechnung enthält Schweizer MwSt. ({{payment.vatRate}}%)
MwSt.-Nummer: CHE-123.456.789 MWST
{{/if}}

{{#if listing}}
Fahrzeug-Informationen:
- Fahrzeug: {{listing.brand}} {{listing.model}} ({{listing.year}})
- Listing-ID: {{listing.id}}
{{#if listing.price}}- Fahrzeugpreis: {{listing.price}} {{listing.currency}}{{/if}}
{{/if}}

Rechnung als PDF: {{invoiceUrl}}

Wichtige Informationen:
- Diese Rechnung wurde automatisch erstellt und ist ohne Unterschrift gültig
- Bewahren Sie diese Rechnung für Ihre Unterlagen auf
- Zahlungsziel: 30 Tage netto

Bei Fragen: billing@motoauto.ch

Vielen Dank für Ihr Vertrauen!
Ihr MotoAuto.ch Team

---
MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz
Datenschutz: {{websiteUrl}}/datenschutz | AGB: {{websiteUrl}}/agb
Abmelden: {{unsubscribeUrl}}',
  'Payment invoice template in German',
  '{"user": {"name": "string", "email": "string"}, "payment": {"id": "string", "amount": "number", "currency": "string", "description": "string", "netAmount": "number", "vatAmount": "number", "vatRate": "number", "created_at": "string"}, "invoice": {"number": "string", "date": "string", "dueDate": "string"}, "listing": {"id": "string", "brand": "string", "model": "string", "year": "number", "price": "number", "currency": "string"}, "invoiceUrl": "string", "websiteUrl": "string", "unsubscribeUrl": "string"}',
  true, true, 'A', 100
),

-- Payment Refund Template
(
  'payment_refund_de', 'payment', 'payment_refund', 'de', 1,
  'Rückerstattung bestätigt - {{refund.amount}} {{refund.currency}}',
  '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rückerstattung bestätigt</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 0 10px; }
        .refund-box { background: #fffbeb; border: 2px solid #f59e0b; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center; }
        .refund-icon { font-size: 60px; color: #f59e0b; margin-bottom: 15px; }
        .refund-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .amount-highlight { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .timeline-info { background: #e7f3ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        @media (max-width: 600px) {
            .detail-row { flex-direction: column; }
            .detail-label { margin-bottom: 5px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MotoAuto.ch</div>
            <p>💰 Rückerstattung verarbeitet</p>
        </div>
        
        <div class="content">
            <div class="refund-box">
                <div class="refund-icon">💰</div>
                <h2>Rückerstattung bestätigt!</h2>
                <p>Ihre Rückerstattung wurde erfolgreich verarbeitet.</p>
                <div class="amount-highlight">{{refund.amount}} {{refund.currency}}</div>
            </div>
            
            <h3>Rückerstattungsdetails</h3>
            <div class="refund-details">
                <div class="detail-row">
                    <span class="detail-label">Rückerstattungs-ID:</span>
                    <span class="detail-value">{{refund.id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ursprüngliche Zahlung:</span>
                    <span class="detail-value">{{payment.id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Grund:</span>
                    <span class="detail-value">{{refund.reason}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Rückerstattungsbetrag:</span>
                    <span class="detail-value">{{refund.amount}} {{refund.currency}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ursprünglicher Betrag:</span>
                    <span class="detail-value">{{payment.amount}} {{payment.currency}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Zahlungsmethode:</span>
                    <span class="detail-value">{{payment.method}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Verarbeitungsdatum:</span>
                    <span class="detail-value">{{formatDate refund.created_at}}</span>
                </div>
            </div>
            
            <div class="timeline-info">
                <h4>⏰ Wann erhalte ich mein Geld zurück?</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li><strong>Kreditkarte:</strong> 3-5 Werktage</li>
                    <li><strong>PayPal:</strong> Sofort verfügbar</li>
                    <li><strong>Banküberweisung:</strong> 1-3 Werktage</li>
                    <li><strong>TWINT:</strong> Sofort verfügbar</li>
                </ul>
                <p><small>Die genaue Dauer hängt von Ihrer Bank ab. Das Geld wird auf die ursprüngliche Zahlungsmethode zurückerstattet.</small></p>
            </div>
            
            {{#if listing}}
            <h4>🚗 Betroffenes Fahrzeug</h4>
            <div class="refund-details">
                <div class="detail-row">
                    <span class="detail-label">Fahrzeug:</span>
                    <span class="detail-value">{{listing.brand}} {{listing.model}} ({{listing.year}})</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Listing-ID:</span>
                    <span class="detail-value">{{listing.id}}</span>
                </div>
            </div>
            {{/if}}
            
            {{#if auction}}
            <h4>🔨 Betroffene Auktion</h4>
            <div class="refund-details">
                <div class="detail-row">
                    <span class="detail-label">Auktions-ID:</span>
                    <span class="detail-value">{{auction.id}}</span>
                </div>
                {{#if auction.winningBid}}
                <div class="detail-row">
                    <span class="detail-label">Gewinngebot:</span>
                    <span class="detail-value">{{auction.winningBid}} {{refund.currency}}</span>
                </div>
                {{/if}}
            </div>
            {{/if}}
            
            <div class="timeline-info">
                <h4>📋 Was passiert als nächstes?