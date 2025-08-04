import Handlebars from 'handlebars'
import { EmailTemplate, EmailTemplateVariables } from '@/lib/database/email.types'

// Register Handlebars helpers
Handlebars.registerHelper('formatCurrency', function(amount: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency || 'CHF'
  }).format(amount)
})

Handlebars.registerHelper('formatDate', function(date: string, locale: string = 'de-CH') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
})

Handlebars.registerHelper('formatTimeRemaining', function(endTime: string) {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Beendet'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} Tag${days !== 1 ? 'e' : ''}`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
})

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b
})

Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b
})

Handlebars.registerHelper('lt', function(a: number, b: number) {
  return a < b
})

/**
 * Render email template with variables
 */
export async function renderEmailTemplate(
  template: EmailTemplate,
  variables: EmailTemplateVariables,
  language: string
): Promise<{
  subject: string
  html: string
  text: string
}> {
  try {
    // Add common variables
    const templateVariables = {
      ...variables,
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch',
      supportEmail: process.env.ADMIN_EMAIL || 'support@motoauto.ch',
      currentYear: new Date().getFullYear(),
      language,
      // Add unsubscribe URL if user is provided
      unsubscribeUrl: variables.user?.id 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${generateUnsubscribeToken(variables.user.id)}`
        : undefined
    }

    // Compile templates
    const subjectTemplate = Handlebars.compile(template.subject_template)
    const htmlTemplate = template.html_template ? Handlebars.compile(template.html_template) : null
    const textTemplate = template.text_template ? Handlebars.compile(template.text_template) : null

    // Render templates
    const subject = subjectTemplate(templateVariables)
    const html = htmlTemplate ? htmlTemplate(templateVariables) : generateHtmlFromText(subject, templateVariables)
    const text = textTemplate ? textTemplate(templateVariables) : generateTextFromHtml(html)

    return {
      subject: subject.trim(),
      html: wrapHtmlTemplate(html, templateVariables),
      text: text.trim()
    }

  } catch (error) {
    console.error('Failed to render email template:', error)
    throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate unsubscribe token for user
 */
function generateUnsubscribeToken(userId: string): string {
  // In a real implementation, this should be a secure token
  // For now, we'll use a simple base64 encoding
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64')
}

/**
 * Wrap HTML content in base template
 */
function wrapHtmlTemplate(content: string, variables: EmailTemplateVariables): string {
  const baseTemplate = `
<!DOCTYPE html>
<html lang="{{language}}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            margin: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .tagline {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .content h2 {
            color: #1a365d;
            font-size: 24px;
            margin: 0 0 20px 0;
            font-weight: 600;
        }
        .content h3 {
            color: #2d5a87;
            font-size: 18px;
            margin: 25px 0 15px 0;
            font-weight: 600;
        }
        .content p {
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
            transform: translateY(-1px);
        }
        .info-box {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-box.warning {
            background-color: #fffbeb;
            border-color: #f6e05e;
        }
        .info-box.success {
            background-color: #f0fff4;
            border-color: #68d391;
        }
        .listing-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .listing-title {
            font-size: 20px;
            font-weight: 600;
            color: #1a365d;
            margin: 0 0 10px 0;
        }
        .listing-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 15px 0;
        }
        .listing-detail {
            background-color: #f7fafc;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            color: #4a5568;
        }
        .price {
            font-size: 24px;
            font-weight: 700;
            color: #2d5a87;
            margin: 10px 0;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #718096;
        }
        .footer a {
            color: #3182ce;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #718096;
            text-decoration: none;
        }
        .unsubscribe {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #a0aec0;
        }
        .unsubscribe a {
            color: #a0aec0;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px 15px;
            }
            .listing-details {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MotoAuto.ch</h1>
            <p class="tagline">Schweizer Automobilmarktplatz</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>MotoAuto.ch</strong></p>
            <p>Schweizer Automobilmarktplatz für Fahrzeuge aller Art</p>
            <p>
                <a href="{{websiteUrl}}">Website besuchen</a> | 
                <a href="mailto:{{supportEmail}}">Support kontaktieren</a>
            </p>
            <div class="social-links">
                <a href="{{websiteUrl}}/jak-to-dziala">Wie es funktioniert</a>
                <a href="{{websiteUrl}}/cennik">Preise</a>
                <a href="{{websiteUrl}}/regulamin">AGB</a>
            </div>
            {{#if unsubscribeUrl}}
            <div class="unsubscribe">
                <p>
                    Sie erhalten diese E-Mail, weil Sie bei MotoAuto.ch registriert sind.<br>
                    <a href="{{unsubscribeUrl}}">E-Mail-Einstellungen verwalten</a> | 
                    <a href="{{unsubscribeUrl}}&type=all">Alle E-Mails abbestellen</a>
                </p>
            </div>
            {{/if}}
            <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                © {{currentYear}} MotoAuto.ch. Alle Rechte vorbehalten.
            </p>
        </div>
    </div>
</body>
</html>`

  const template = Handlebars.compile(baseTemplate)
  return template(variables)
}

/**
 * Generate HTML from text content
 */
function generateHtmlFromText(subject: string, variables: EmailTemplateVariables): string {
  return `
    <h2>${subject}</h2>
    <p>Hallo ${variables.user?.name || 'Kunde'},</p>
    <p>diese E-Mail wurde automatisch generiert.</p>
    <p>Bei Fragen wenden Sie sich bitte an unseren Support.</p>
  `
}

/**
 * Generate plain text from HTML
 */
function generateTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Validate template syntax
 */
export function validateTemplate(templateContent: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  try {
    Handlebars.compile(templateContent)
  } catch (error) {
    errors.push(`Template compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Check for required variables
  const requiredVariables = ['user', 'websiteUrl', 'supportEmail']
  const missingVariables = requiredVariables.filter(variable => 
    !templateContent.includes(`{{${variable}}}`) && 
    !templateContent.includes(`{{#if ${variable}}}`)
  )
  
  if (missingVariables.length > 0) {
    errors.push(`Missing required variables: ${missingVariables.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Preview template with sample data
 */
export async function previewTemplate(
  template: EmailTemplate,
  sampleData?: Partial<EmailTemplateVariables>
): Promise<{
  subject: string
  html: string
  text: string
}> {
  const defaultSampleData: EmailTemplateVariables = {
    user: {
      id: 'sample-user-id',
      name: 'Max Mustermann',
      email: 'max.mustermann@example.com',
      language: 'de'
    },
    listing: {
      id: 'sample-listing-id',
      title: 'BMW 3er 320d Touring',
      brand: 'BMW',
      model: '3er',
      price: 25000,
      currency: 'CHF',
      url: 'https://motoauto.ch/ogloszenia/sample-listing-id',
      images: ['https://example.com/image1.jpg']
    },
    auction: {
      id: 'sample-auction-id',
      currentBid: 24500,
      bidCount: 5,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      timeRemaining: '2h 15m',
      isExtended: false
    },
    payment: {
      id: 'sample-payment-id',
      amount: 29.90,
      currency: 'CHF',
      description: 'Premium Listing Package',
      method: 'credit_card',
      status: 'completed'
    },
    contact: {
      id: 'sample-contact-id',
      name: 'Anna Müller',
      email: 'anna.mueller@example.com',
      subject: 'Interesse an Ihrem Fahrzeug',
      message: 'Hallo, ich interessiere mich für Ihr Fahrzeug. Ist es noch verfügbar?',
      category: 'listing_inquiry'
    },
    websiteUrl: 'https://motoauto.ch',
    supportEmail: 'support@motoauto.ch',
    ...sampleData
  }

  return renderEmailTemplate(template, defaultSampleData, template.language)
}