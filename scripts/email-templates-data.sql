-- Comprehensive Email Templates for MotoAuto.ch
-- This script adds all email templates for the notification system

-- Clear existing templates (optional - remove if you want to keep existing ones)
-- DELETE FROM email_templates;

-- AUCTION NOTIFICATION TEMPLATES

-- 1. AUCTION OUTBID NOTIFICATIONS
INSERT INTO email_templates (name, category, type, language, subject_template, html_template, text_template, description, variables) VALUES

-- German
('auction_outbid', 'auction', 'transactional', 'de', 
'Sie wurden überboten - {{listing.brand}} {{listing.model}}',
'<h2>🏁 Sie wurden überboten!</h2>
<p>Hallo {{user.name}},</p>
<p>leider wurden Sie bei der Auktion überboten. Aber keine Sorge - Sie können noch mitbieten!</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Jahr: {{listing.year}}</span>
        <span class="listing-detail">Kilometerstand: {{listing.mileage}} km</span>
        <span class="listing-detail">Kraftstoff: {{listing.fuelType}}</span>
    </div>
    <div class="price">Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}</div>
    <p><strong>Anzahl Gebote:</strong> {{auction.bidCount}}</p>
    <p><strong>Auktion endet:</strong> {{formatDate auction.endTime}}</p>
    <p><strong>Verbleibende Zeit:</strong> {{formatTimeRemaining auction.endTime}}</p>
</div>

<div class="info-box warning">
    <p><strong>⏰ Schnell handeln!</strong></p>
    <p>Die Auktion läuft noch {{formatTimeRemaining auction.endTime}}. Geben Sie jetzt Ihr Gebot ab, um wieder in Führung zu gehen!</p>
</div>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{listing.url}}" class="button">Jetzt mitbieten</a>
</p>

<p>Sie können auch ein automatisches Gebot einrichten, damit Sie nicht ständig die Auktion verfolgen müssen.</p>

<p>Viel Erfolg bei der Auktion!</p>',

'Sie wurden überboten - {{listing.brand}} {{listing.model}}

Hallo {{user.name}},

leider wurden Sie bei der Auktion überboten. Aber keine Sorge - Sie können noch mitbieten!

Fahrzeug: {{listing.brand}} {{listing.model}}
Jahr: {{listing.year}}
Kilometerstand: {{listing.mileage}} km
Kraftstoff: {{listing.fuelType}}

Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}
Anzahl Gebote: {{auction.bidCount}}
Auktion endet: {{formatDate auction.endTime}}
Verbleibende Zeit: {{formatTimeRemaining auction.endTime}}

⏰ Schnell handeln!
Die Auktion läuft noch {{formatTimeRemaining auction.endTime}}. Geben Sie jetzt Ihr Gebot ab, um wieder in Führung zu gehen!

Jetzt mitbieten: {{listing.url}}

Sie können auch ein automatisches Gebot einrichten, damit Sie nicht ständig die Auktion verfolgen müssen.

Viel Erfolg bei der Auktion!

Mit freundlichen Grüßen,
Ihr MotoAuto.ch Team',

'Notification when user is outbid in auction',
'{"user": {"name": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number", "bidCount": "number", "endTime": "string"}}'),

-- French
('auction_outbid', 'auction', 'transactional', 'fr',
'Vous avez été surenchéri - {{listing.brand}} {{listing.model}}',
'<h2>🏁 Vous avez été surenchéri!</h2>
<p>Bonjour {{user.name}},</p>
<p>malheureusement, vous avez été surenchéri dans cette enchère. Mais ne vous inquiétez pas - vous pouvez encore enchérir!</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Année: {{listing.year}}</span>
        <span class="listing-detail">Kilométrage: {{listing.mileage}} km</span>
        <span class="listing-detail">Carburant: {{listing.fuelType}}</span>
    </div>
    <div class="price">Enchère actuelle: {{formatCurrency auction.currentBid listing.currency}}</div>
    <p><strong>Nombre d''enchères:</strong> {{auction.bidCount}}</p>
    <p><strong>Fin de l''enchère:</strong> {{formatDate auction.endTime}}</p>
    <p><strong>Temps restant:</strong> {{formatTimeRemaining auction.endTime}}</p>
</div>

<div class="info-box warning">
    <p><strong>⏰ Agissez rapidement!</strong></p>
    <p>L''enchère se termine dans {{formatTimeRemaining auction.endTime}}. Placez votre enchère maintenant pour reprendre la tête!</p>
</div>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{listing.url}}" class="button">Enchérir maintenant</a>
</p>

<p>Vous pouvez également configurer une enchère automatique pour ne pas avoir à surveiller constamment l''enchère.</p>

<p>Bonne chance pour l''enchère!</p>',

'Vous avez été surenchéri - {{listing.brand}} {{listing.model}}

Bonjour {{user.name}},

malheureusement, vous avez été surenchéri dans cette enchère. Mais ne vous inquiétez pas - vous pouvez encore enchérir!

Véhicule: {{listing.brand}} {{listing.model}}
Année: {{listing.year}}
Kilométrage: {{listing.mileage}} km
Carburant: {{listing.fuelType}}

Enchère actuelle: {{formatCurrency auction.currentBid listing.currency}}
Nombre d''enchères: {{auction.bidCount}}
Fin de l''enchère: {{formatDate auction.endTime}}
Temps restant: {{formatTimeRemaining auction.endTime}}

⏰ Agissez rapidement!
L''enchère se termine dans {{formatTimeRemaining auction.endTime}}. Placez votre enchère maintenant pour reprendre la tête!

Enchérir maintenant: {{listing.url}}

Vous pouvez également configurer une enchère automatique pour ne pas avoir à surveiller constamment l''enchère.

Bonne chance pour l''enchère!

Cordialement,
L''équipe MotoAuto.ch',

'Notification when user is outbid in auction (French)',
'{"user": {"name": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number", "bidCount": "number", "endTime": "string"}}'),

-- 2. AUCTION ENDING SOON NOTIFICATIONS
('auction_ending_soon', 'auction', 'transactional', 'de',
'⏰ Auktion endet bald - {{listing.brand}} {{listing.model}}',
'<h2>⏰ Auktion endet bald!</h2>
<p>Hallo {{user.name}},</p>
<p>die Auktion für das Fahrzeug, das Sie beobachten, endet bald. Verpassen Sie nicht Ihre Chance!</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Jahr: {{listing.year}}</span>
        <span class="listing-detail">Kilometerstand: {{listing.mileage}} km</span>
        <span class="listing-detail">Kraftstoff: {{listing.fuelType}}</span>
    </div>
    <div class="price">{{#if auction.currentBid}}Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}{{else}}Startpreis: {{formatCurrency auction.startingPrice listing.currency}}{{/if}}</div>
    <p><strong>Anzahl Gebote:</strong> {{auction.bidCount}}</p>
    <p><strong>Auktion endet:</strong> {{formatDate auction.endTime}}</p>
    <p><strong>⏰ Verbleibende Zeit:</strong> <span style="color: #e53e3e; font-weight: bold;">{{formatTimeRemaining auction.endTime}}</span></p>
</div>

<div class="info-box warning">
    <p><strong>🚨 Letzte Chance!</strong></p>
    <p>Diese Auktion endet in {{formatTimeRemaining auction.endTime}}. {{#if auction.currentBid}}{{#eq user.id auction.highestBidderId}}Sie führen aktuell, aber andere Bieter könnten noch zuschlagen!{{else}}Geben Sie jetzt Ihr Gebot ab, bevor es zu spät ist!{{/eq}}{{else}}Seien Sie der Erste, der ein Gebot abgibt!{{/if}}</p>
</div>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{listing.url}}" class="button">{{#if auction.currentBid}}{{#eq user.id auction.highestBidderId}}Gebot erhöhen{{else}}Jetzt bieten{{/eq}}{{else}}Erstes Gebot abgeben{{/if}}</a>
</p>

<p><strong>💡 Tipp:</strong> Nutzen Sie die Auto-Bid-Funktion, um automatisch bis zu Ihrem Maximalgebot zu bieten!</p>',

'⏰ Auktion endet bald - {{listing.brand}} {{listing.model}}

Hallo {{user.name}},

die Auktion für das Fahrzeug, das Sie beobachten, endet bald. Verpassen Sie nicht Ihre Chance!

Fahrzeug: {{listing.brand}} {{listing.model}}
Jahr: {{listing.year}}
Kilometerstand: {{listing.mileage}} km
Kraftstoff: {{listing.fuelType}}

{{#if auction.currentBid}}Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}{{else}}Startpreis: {{formatCurrency auction.startingPrice listing.currency}}{{/if}}
Anzahl Gebote: {{auction.bidCount}}
Auktion endet: {{formatDate auction.endTime}}
⏰ Verbleibende Zeit: {{formatTimeRemaining auction.endTime}}

🚨 Letzte Chance!
Diese Auktion endet in {{formatTimeRemaining auction.endTime}}. {{#if auction.currentBid}}{{#eq user.id auction.highestBidderId}}Sie führen aktuell, aber andere Bieter könnten noch zuschlagen!{{else}}Geben Sie jetzt Ihr Gebot ab, bevor es zu spät ist!{{/eq}}{{else}}Seien Sie der Erste, der ein Gebot abgibt!{{/if}}

Zur Auktion: {{listing.url}}

💡 Tipp: Nutzen Sie die Auto-Bid-Funktion, um automatisch bis zu Ihrem Maximalgebot zu bieten!

Mit freundlichen Grüßen,
Ihr MotoAuto.ch Team',

'Notification when auction is ending soon',
'{"user": {"name": "string", "id": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number", "startingPrice": "number", "bidCount": "number", "endTime": "string", "highestBidderId": "string"}}'),

-- 3. AUCTION WON NOTIFICATIONS
('auction_won', 'auction', 'transactional', 'de',
'🎉 Herzlichen Glückwunsch! Sie haben die Auktion gewonnen - {{listing.brand}} {{listing.model}}',
'<h2>🎉 Herzlichen Glückwunsch!</h2>
<p>Hallo {{user.name}},</p>
<p><strong>Sie haben die Auktion gewonnen!</strong> Das Fahrzeug gehört jetzt Ihnen.</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Jahr: {{listing.year}}</span>
        <span class="listing-detail">Kilometerstand: {{listing.mileage}} km</span>
        <span class="listing-detail">Kraftstoff: {{listing.fuelType}}</span>
    </div>
    <div class="price">Ihr Gebot: {{formatCurrency auction.winningBid listing.currency}}</div>
    <p><strong>Gesamte Gebote:</strong> {{auction.totalBids}}</p>
    <p><strong>Auktion beendet:</strong> {{formatDate auction.endedAt}}</p>
</div>

<div class="info-box success">
    <p><strong>🎯 Sie haben gewonnen!</strong></p>
    <p>Ihr Gebot von {{formatCurrency auction.winningBid listing.currency}} war das höchste. Das Fahrzeug ist jetzt für Sie reserviert.</p>
</div>

<h3>📋 Nächste Schritte:</h3>
<ol>
    <li><strong>Zahlung:</strong> Bitte überweisen Sie den Betrag von {{formatCurrency auction.winningBid listing.currency}} innerhalb von 7 Tagen</li>
    <li><strong>Kommission:</strong> Eine Kommission von {{formatCurrency payment.commissionAmount payment.currency}} ({{payment.commissionRate}}%) wird separat berechnet</li>
    <li><strong>Kontakt:</strong> Der Verkäufer wird sich in Kürze mit Ihnen in Verbindung setzen</li>
    <li><strong>Abholung:</strong> Vereinbaren Sie einen Termin zur Fahrzeugübergabe</li>
</ol>

<div class="info-box">
    <p><strong>💳 Zahlungsinformationen:</strong></p>
    <p>Empfänger: {{seller.name}}<br>
    IBAN: {{seller.iban}}<br>
    Verwendungszweck: Auktion {{auction.id}} - {{listing.brand}} {{listing.model}}</p>
</div>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{listing.url}}" class="button">Auktionsdetails ansehen</a>
    <a href="{{paymentUrl}}" class="button">Kommission bezahlen</a>
</p>

<p><strong>📞 Kontakt zum Verkäufer:</strong><br>
{{seller.name}}<br>
E-Mail: {{seller.email}}<br>
{{#if seller.phone}}Telefon: {{seller.phone}}{{/if}}</p>

<p>Wir gratulieren Ihnen nochmals zu Ihrem erfolgreichen Gebot!</p>',

'🎉 Herzlichen Glückwunsch! Sie haben die Auktion gewonnen - {{listing.brand}} {{listing.model}}

Hallo {{user.name}},

Sie haben die Auktion gewonnen! Das Fahrzeug gehört jetzt Ihnen.

Fahrzeug: {{listing.brand}} {{listing.model}}
Jahr: {{listing.year}}
Kilometerstand: {{listing.mileage}} km
Kraftstoff: {{listing.fuelType}}

Ihr Gebot: {{formatCurrency auction.winningBid listing.currency}}
Gesamte Gebote: {{auction.totalBids}}
Auktion beendet: {{formatDate auction.endedAt}}

🎯 Sie haben gewonnen!
Ihr Gebot von {{formatCurrency auction.winningBid listing.currency}} war das höchste. Das Fahrzeug ist jetzt für Sie reserviert.

📋 Nächste Schritte:
1. Zahlung: Bitte überweisen Sie den Betrag von {{formatCurrency auction.winningBid listing.currency}} innerhalb von 7 Tagen
2. Kommission: Eine Kommission von {{formatCurrency payment.commissionAmount payment.currency}} ({{payment.commissionRate}}%) wird separat berechnet
3. Kontakt: Der Verkäufer wird sich in Kürze mit Ihnen in Verbindung setzen
4. Abholung: Vereinbaren Sie einen Termin zur Fahrzeugübergabe

💳 Zahlungsinformationen:
Empfänger: {{seller.name}}
IBAN: {{seller.iban}}
Verwendungszweck: Auktion {{auction.id}} - {{listing.brand}} {{listing.model}}

Auktionsdetails: {{listing.url}}
Kommission bezahlen: {{paymentUrl}}

📞 Kontakt zum Verkäufer:
{{seller.name}}
E-Mail: {{seller.email}}
{{#if seller.phone}}Telefon: {{seller.phone}}{{/if}}

Wir gratulieren Ihnen nochmals zu Ihrem erfolgreichen Gebot!

Mit freundlichen Grüßen,
Ihr MotoAuto.ch Team',

'Notification when user wins an auction',
'{"user": {"name": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "url": "string", "currency": "string"}, "auction": {"winningBid": "number", "totalBids": "number", "endedAt": "string", "id": "string"}, "payment": {"commissionAmount": "number", "commissionRate": "number", "currency": "string"}, "seller": {"name": "string", "email": "string", "phone": "string", "iban": "string"}, "paymentUrl": "string"}'),

-- 4. AUCTION LOST NOTIFICATIONS
('auction_lost', 'auction', 'transactional', 'de',
'Auktion beendet - {{listing.brand}} {{listing.model}}',
'<h2>Auktion beendet</h2>
<p>Hallo {{user.name}},</p>
<p>die Auktion für das Fahrzeug, an dem Sie interessiert waren, ist beendet.</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Jahr: {{listing.year}}</span>
        <span class="listing-detail">Kilometerstand: {{listing.mileage}} km</span>
        <span class="listing-detail">Kraftstoff: {{listing.fuelType}}</span>
    </div>
    <div class="price">Verkaufspreis: {{formatCurrency auction.winningBid listing.currency}}</div>
    <p><strong>Ihr höchstes Gebot:</strong> {{formatCurrency userBid.amount listing.currency}}</p>
    <p><strong>Gesamte Gebote:</strong> {{auction.totalBids}}</p>
    <p><strong>Auktion beendet:</strong> {{formatDate auction.endedAt}}</p>
</div>

<div class="info-box">
    <p><strong>Schade, diesmal hat es nicht geklappt.</strong></p>
    <p>Das Fahrzeug wurde für {{formatCurrency auction.winningBid listing.currency}} verkauft. Ihr höchstes Gebot lag bei {{formatCurrency userBid.amount listing.currency}}.</p>
</div>

<h3>🔍 Ähnliche Fahrzeuge finden</h3>
<p>Lassen Sie sich nicht entmutigen! Wir haben viele ähnliche Fahrzeuge in unserem Angebot.</p>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{searchUrl}}" class="button">Ähnliche {{listing.brand}} {{listing.model}} finden</a>
    <a href="{{websiteUrl}}/aukcje" class="button">Alle Auktionen ansehen</a>
</p>

<div class="info-box">
    <p><strong>💡 Tipp für die nächste Auktion:</strong></p>
    <ul>
        <li>Nutzen Sie die Auto-Bid-Funktion für automatische Gebote</li>
        <li>Setzen Sie sich ein realistisches Maximum vor der Auktion</li>
        <li>Beobachten Sie die letzten Minuten der Auktion</li>
        <li>Berücksichtigen Sie zusätzliche Kosten (Kommission, Transport)</li>
    </ul>
</div>

<p>Viel Erfolg bei Ihrer nächsten Auktion!</p>',

'Auktion beendet - {{listing.brand}} {{listing.model}}

Hallo {{user.name}},

die Auktion für das Fahrzeug, an dem Sie interessiert waren, ist beendet.

Fahrzeug: {{listing.brand}} {{listing.model}}
Jahr: {{listing.year}}
Kilometerstand: {{listing.mileage}} km
Kraftstoff: {{listing.fuelType}}

Verkaufspreis: {{formatCurrency auction.winningBid listing.currency}}
Ihr höchstes Gebot: {{formatCurrency userBid.amount listing.currency}}
Gesamte Gebote: {{auction.totalBids}}
Auktion beendet: {{formatDate auction.endedAt}}

Schade, diesmal hat es nicht geklappt.
Das Fahrzeug wurde für {{formatCurrency auction.winningBid listing.currency}} verkauft. Ihr höchstes Gebot lag bei {{formatCurrency userBid.amount listing.currency}}.

🔍 Ähnliche Fahrzeuge finden
Lassen Sie sich nicht entmutigen! Wir haben viele ähnliche Fahrzeuge in unserem Angebot.

Ähnliche {{listing.brand}} {{listing.model}} finden: {{searchUrl}}
Alle Auktionen ansehen: {{websiteUrl}}/aukcje

💡 Tipp für die nächste Auktion:
- Nutzen Sie die Auto-Bid-Funktion für automatische Gebote
- Setzen Sie sich ein realistisches Maximum vor der Auktion
- Beobachten Sie die letzten Minuten der Auktion
- Berücksichtigen Sie zusätzliche Kosten (Kommission, Transport)

Viel Erfolg bei Ihrer nächsten Auktion!

Mit freundlichen Grüßen,
Ihr MotoAuto.ch Team',

'Notification when user loses an auction',
'{"user": {"name": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "currency": "string"}, "auction": {"winningBid": "number", "totalBids": "number", "endedAt": "string"}, "userBid": {"amount": "number"}, "searchUrl": "string", "websiteUrl": "string"}'),

-- 5. AUCTION EXTENDED NOTIFICATIONS
('auction_extended', 'auction', 'transactional', 'de',
'⏰ Auktion verlängert - {{listing.brand}} {{listing.model}}',
'<h2>⏰ Auktion wurde verlängert!</h2>
<p>Hallo {{user.name}},</p>
<p>die Auktion wurde aufgrund eines Gebots in den letzten Minuten automatisch um 5 Minuten verlängert.</p>

<div class="listing-card">
    <h3 class="listing-title">{{listing.brand}} {{listing.model}}</h3>
    <div class="listing-details">
        <span class="listing-detail">Jahr: {{listing.year}}</span>
        <span class="listing-detail">Kilometerstand: {{listing.mileage}} km</span>
        <span class="listing-detail">Kraftstoff: {{listing.fuelType}}</span>
    </div>
    <div class="price">Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}</div>
    <p><strong>Anzahl Gebote:</strong> {{auction.bidCount}}</p>
    <p><strong>Neue Endzeit:</strong> {{formatDate auction.newEndTime}}</p>
    <p><strong>Verbleibende Zeit:</strong> {{formatTimeRemaining auction.newEndTime}}</p>
    <p><strong>Verlängerungen:</strong> {{auction.extensionCount}}/{{auction.maxExtensions}}</p>
</div>

<div class="info-box warning">
    <p><strong>🔥 Spannende Schlussphase!</strong></p>
    <p>Die Auktion wurde verlängert, weil in den letzten 5 Minuten ein Gebot abgegeben wurde. {{#eq user.id auction.highestBidderId}}Sie führen aktuell!{{else}}Sie haben noch eine Chance zu bieten!{{/eq}}</p>
</div>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{listing.url}}" class="button">{{#eq user.id auction.highestBidderId}}Gebot verteidigen{{else}}Jetzt bieten{{/eq}}</a>
</p>

<p><strong>ℹ️ Hinweis:</strong> Die Auktion kann maximal {{auction.maxExtensions}} Mal verlängert werden. Dies ist Verlängerung Nr. {{auction.extensionCount}}.</p>',

'⏰ Auktion verlängert - {{listing.brand}} {{listing.model}}

Hallo {{user.name}},

die Auktion wurde aufgrund eines Gebots in den letzten Minuten automatisch um 5 Minuten verlängert.

Fahrzeug: {{listing.brand}} {{listing.model}}
Jahr: {{listing.year}}
Kilometerstand: {{listing.mileage}} km
Kraftstoff: {{listing.fuelType}}

Aktuelles Gebot: {{formatCurrency auction.currentBid listing.currency}}
Anzahl Gebote: {{auction.bidCount}}
Neue Endzeit: {{formatDate auction.newEndTime}}
Verbleibende Zeit: {{formatTimeRemaining auction.newEndTime}}
Verlängerungen: {{auction.extensionCount}}/{{auction.maxExtensions}}

🔥 Spannende Schlussphase!
Die Auktion wurde verlängert, weil in den letzten 5 Minuten ein Gebot abgegeben wurde. {{#eq user.id auction.highestBidderId}}Sie führen aktuell!{{else}}Sie haben noch eine Chance zu bieten!{{/eq}}

Zur Auktion: {{listing.url}}

ℹ️ Hinweis: Die Auktion kann maximal {{auction.maxExtensions}} Mal verlängert werden. Dies ist Verlängerung Nr. {{auction.extensionCount}}.

Mit freundlichen Grüßen,
Ihr MotoAuto.ch Team',

'Notification when auction is extended',
'{"user": {"name": "string", "id": "string"}, "listing": {"brand": "string", "model": "string", "year": "number", "mileage": "number", "fuelType": "string", "url": "string", "currency": "string"}, "auction": {"currentBid": "number", "bidCount": "number", "newEndTime": "string", "extensionCount": "number", "maxExtensions": "number", "highestBidderId": "string"}}')

ON CONFLICT (name, language, version) DO UPDATE SET
    subject_template = EXCLUDED.subject_template,
    html_template = EXCLUDED.html_template,
    text_template = EXCLUDED.text_template,
    description = EXCLUDED.description,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- Add Polish and English versions for all auction templates
-- (This would continue with all the other language versions...)

COMMENT ON TABLE email_templates IS 'Multi-language email templates for comprehensive notification system';