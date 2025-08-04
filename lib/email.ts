import { ContactMessage, ContactResponse, Listing, Profile } from "@/lib/database.types"
import { EmailTemplateInput } from "@/lib/schemas/contact-api-schema"

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@motoauto.ch'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@motoauto.ch'

// Email templates configuration
const EMAIL_TEMPLATES = {
  contact_confirmation: {
    de: {
      subject: 'Bestätigung Ihrer Kontaktanfrage - MotoAuto.ch',
      template: 'contact-confirmation-de'
    },
    fr: {
      subject: 'Confirmation de votre demande de contact - MotoAuto.ch',
      template: 'contact-confirmation-fr'
    },
    pl: {
      subject: 'Potwierdzenie Twojego zapytania - MotoAuto.ch',
      template: 'contact-confirmation-pl'
    },
    en: {
      subject: 'Contact Request Confirmation - MotoAuto.ch',
      template: 'contact-confirmation-en'
    }
  },
  contact_response: {
    de: {
      subject: 'Antwort auf Ihre Kontaktanfrage - MotoAuto.ch',
      template: 'contact-response-de'
    },
    fr: {
      subject: 'Réponse à votre demande de contact - MotoAuto.ch',
      template: 'contact-response-fr'
    },
    pl: {
      subject: 'Odpowiedź na Twoje zapytanie - MotoAuto.ch',
      template: 'contact-response-pl'
    },
    en: {
      subject: 'Response to Your Contact Request - MotoAuto.ch',
      template: 'contact-response-en'
    }
  },
  listing_inquiry_notification: {
    de: {
      subject: 'Neue Anfrage zu Ihrem Fahrzeug - MotoAuto.ch',
      template: 'listing-inquiry-notification-de'
    },
    fr: {
      subject: 'Nouvelle demande pour votre véhicule - MotoAuto.ch',
      template: 'listing-inquiry-notification-fr'
    },
    pl: {
      subject: 'Nowe zapytanie o Twój pojazd - MotoAuto.ch',
      template: 'listing-inquiry-notification-pl'
    },
    en: {
      subject: 'New Inquiry About Your Vehicle - MotoAuto.ch',
      template: 'listing-inquiry-notification-en'
    }
  },
  admin_notification: {
    de: {
      subject: 'Neue Kontaktanfrage - MotoAuto.ch Admin',
      template: 'admin-notification-de'
    },
    fr: {
      subject: 'Nouvelle demande de contact - MotoAuto.ch Admin',
      template: 'admin-notification-fr'
    },
    pl: {
      subject: 'Nowe zapytanie kontaktowe - MotoAuto.ch Admin',
      template: 'admin-notification-pl'
    },
    en: {
      subject: 'New Contact Request - MotoAuto.ch Admin',
      template: 'admin-notification-en'
    }
  }
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  deliveryStatus?: 'sent' | 'failed' | 'pending'
}

/**
 * Send email using configured SMTP settings
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // Check if email is configured
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('Email not configured, skipping email send')
      return {
        success: false,
        error: 'Email configuration missing',
        deliveryStatus: 'failed'
      }
    }

    // In a real implementation, you would use a library like nodemailer
    // For now, we'll simulate the email sending
    console.log('Sending email:', {
      to: options.to,
      subject: options.subject,
      from: options.from || SMTP_FROM
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // In production, replace this with actual email sending logic:
    /*
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })

    const result = await transporter.sendMail({
      from: options.from || SMTP_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments
    })

    return {
      success: true,
      messageId: result.messageId,
      deliveryStatus: 'sent'
    }
    */

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      deliveryStatus: 'sent'
    }

  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed',
      deliveryStatus: 'failed'
    }
  }
}

/**
 * Send contact form confirmation email to user
 */
export async function sendContactConfirmation(
  contactMessage: ContactMessage,
  listing?: Listing
): Promise<EmailResult> {
  const language = contactMessage.language as keyof typeof EMAIL_TEMPLATES.contact_confirmation
  const template = EMAIL_TEMPLATES.contact_confirmation[language] || EMAIL_TEMPLATES.contact_confirmation.de

  const variables = {
    name: contactMessage.name,
    subject: contactMessage.subject,
    message: contactMessage.message,
    category: contactMessage.category,
    contactId: contactMessage.id,
    listing: listing ? {
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      price: listing.price,
      currency: listing.currency
    } : null,
    supportEmail: ADMIN_EMAIL,
    websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch'
  }

  const html = await renderEmailTemplate(template.template, variables)
  const text = generateTextFromHtml(html)

  return sendEmail({
    to: contactMessage.email,
    subject: template.subject,
    html,
    text,
    replyTo: ADMIN_EMAIL
  })
}

/**
 * Send listing inquiry notification to listing owner
 */
export async function sendListingInquiryNotification(
  contactMessage: ContactMessage,
  listing: Listing,
  listingOwner: Profile
): Promise<EmailResult> {
  const language = listingOwner.preferred_language as keyof typeof EMAIL_TEMPLATES.listing_inquiry_notification
  const template = EMAIL_TEMPLATES.listing_inquiry_notification[language] || EMAIL_TEMPLATES.listing_inquiry_notification.de

  const variables = {
    ownerName: listingOwner.full_name || listingOwner.email,
    inquirerName: contactMessage.name,
    inquirerEmail: contactMessage.email,
    inquirerPhone: contactMessage.phone,
    subject: contactMessage.subject,
    message: contactMessage.message,
    listing: {
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      currency: listing.currency,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/ogloszenia/${listing.id}`
    },
    contactId: contactMessage.id,
    websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch'
  }

  const html = await renderEmailTemplate(template.template, variables)
  const text = generateTextFromHtml(html)

  return sendEmail({
    to: listingOwner.email,
    subject: template.subject,
    html,
    text,
    replyTo: contactMessage.email
  })
}

/**
 * Send admin notification for new contact messages
 */
export async function sendAdminNotification(
  contactMessage: ContactMessage,
  listing?: Listing
): Promise<EmailResult> {
  const template = EMAIL_TEMPLATES.admin_notification.en

  const variables = {
    contactId: contactMessage.id,
    name: contactMessage.name,
    email: contactMessage.email,
    phone: contactMessage.phone,
    subject: contactMessage.subject,
    message: contactMessage.message,
    category: contactMessage.category,
    language: contactMessage.language,
    priority: contactMessage.priority,
    recaptchaScore: contactMessage.recaptcha_score,
    listing: listing ? {
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/ogloszenia/${listing.id}`
    } : null,
    adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/contact/${contactMessage.id}`,
    createdAt: contactMessage.created_at
  }

  const html = await renderEmailTemplate(template.template, variables)
  const text = generateTextFromHtml(html)

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html,
    text
  })
}

/**
 * Send response email to contact message author
 */
export async function sendContactResponse(
  contactMessage: ContactMessage,
  response: ContactResponse,
  responder?: Profile
): Promise<EmailResult> {
  const language = contactMessage.language as keyof typeof EMAIL_TEMPLATES.contact_response
  const template = EMAIL_TEMPLATES.contact_response[language] || EMAIL_TEMPLATES.contact_response.de

  const variables = {
    name: contactMessage.name,
    originalSubject: contactMessage.subject,
    originalMessage: contactMessage.message,
    response: response.response_text,
    responderName: responder?.full_name || 'MotoAuto.ch Support',
    contactId: contactMessage.id,
    supportEmail: ADMIN_EMAIL,
    websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch'
  }

  const html = await renderEmailTemplate(template.template, variables)
  const text = generateTextFromHtml(html)

  return sendEmail({
    to: contactMessage.email,
    subject: template.subject,
    html,
    text,
    replyTo: responder?.email || ADMIN_EMAIL
  })
}

/**
 * Render email template with variables
 */
async function renderEmailTemplate(templateName: string, variables: Record<string, any>): Promise<string> {
  // In a real implementation, you would use a template engine like Handlebars, Mustache, or React Email
  // For now, we'll create a simple template
  
  const baseTemplate = `
    <!DOCTYPE html>
    <html lang="{{language}}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{{subject}}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a365d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px; }
        .listing-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MotoAuto.ch</h1>
      </div>
      <div class="content">
        {{content}}
      </div>
      <div class="footer">
        <p>MotoAuto.ch - Schweizer Automobilmarktplatz</p>
        <p><a href="{{websiteUrl}}">{{websiteUrl}}</a></p>
      </div>
    </body>
    </html>
  `

  // Generate content based on template name
  let content = ''
  
  switch (templateName) {
    case 'contact-confirmation-de':
      content = `
        <h2>Vielen Dank für Ihre Kontaktanfrage!</h2>
        <p>Liebe/r ${variables.name},</p>
        <p>wir haben Ihre Kontaktanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
        <div class="listing-info">
          <h3>Ihre Anfrage:</h3>
          <p><strong>Betreff:</strong> ${variables.subject}</p>
          <p><strong>Nachricht:</strong> ${variables.message}</p>
          <p><strong>Kategorie:</strong> ${variables.category}</p>
          ${variables.listing ? `
            <h4>Fahrzeug:</h4>
            <p>${variables.listing.brand} ${variables.listing.model} - ${variables.listing.price} ${variables.listing.currency}</p>
          ` : ''}
        </div>
        <p>Bei Fragen können Sie uns jederzeit unter <a href="mailto:${variables.supportEmail}">${variables.supportEmail}</a> kontaktieren.</p>
      `
      break
      
    case 'listing-inquiry-notification-de':
      content = `
        <h2>Neue Anfrage zu Ihrem Fahrzeug</h2>
        <p>Hallo ${variables.ownerName},</p>
        <p>Sie haben eine neue Anfrage zu Ihrem Fahrzeug erhalten:</p>
        <div class="listing-info">
          <h3>Fahrzeug:</h3>
          <p><strong>${variables.listing.brand} ${variables.listing.model}</strong></p>
          <p>Jahr: ${variables.listing.year} | Preis: ${variables.listing.price} ${variables.listing.currency}</p>
          <a href="${variables.listing.url}" class="button">Anzeige ansehen</a>
        </div>
        <div class="listing-info">
          <h3>Anfrage von:</h3>
          <p><strong>Name:</strong> ${variables.inquirerName}</p>
          <p><strong>E-Mail:</strong> ${variables.inquirerEmail}</p>
          ${variables.inquirerPhone ? `<p><strong>Telefon:</strong> ${variables.inquirerPhone}</p>` : ''}
          <p><strong>Betreff:</strong> ${variables.subject}</p>
          <p><strong>Nachricht:</strong> ${variables.message}</p>
        </div>
        <p>Sie können direkt auf diese E-Mail antworten, um mit dem Interessenten in Kontakt zu treten.</p>
      `
      break
      
    case 'admin-notification-en':
      content = `
        <h2>New Contact Request</h2>
        <div class="listing-info">
          <h3>Contact Details:</h3>
          <p><strong>ID:</strong> ${variables.contactId}</p>
          <p><strong>Name:</strong> ${variables.name}</p>
          <p><strong>Email:</strong> ${variables.email}</p>
          ${variables.phone ? `<p><strong>Phone:</strong> ${variables.phone}</p>` : ''}
          <p><strong>Category:</strong> ${variables.category}</p>
          <p><strong>Language:</strong> ${variables.language}</p>
          <p><strong>Priority:</strong> ${variables.priority}</p>
          <p><strong>reCAPTCHA Score:</strong> ${variables.recaptchaScore}</p>
          <p><strong>Subject:</strong> ${variables.subject}</p>
          <p><strong>Message:</strong> ${variables.message}</p>
          ${variables.listing ? `
            <h4>Related Listing:</h4>
            <p>${variables.listing.brand} ${variables.listing.model} (ID: ${variables.listing.id})</p>
            <a href="${variables.listing.url}" class="button">View Listing</a>
          ` : ''}
        </div>
        <a href="${variables.adminUrl}" class="button">Manage in Admin</a>
      `
      break
      
    default:
      content = `
        <h2>Contact Message</h2>
        <p>Hello ${variables.name},</p>
        <p>Thank you for contacting MotoAuto.ch. We will get back to you soon.</p>
      `
  }

  // Replace variables in template
  let html = baseTemplate.replace('{{content}}', content)
  
  // Replace other variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, String(value || ''))
  })

  return html
}

/**
 * Generate plain text from HTML email
 */
function generateTextFromHtml(html: string): string {
  // Simple HTML to text conversion
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
 * Validate email configuration
 */
export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS)
}

/**
 * Get email configuration status
 */
export function getEmailConfig() {
  return {
    configured: isEmailConfigured(),
    host: SMTP_HOST ? '***configured***' : 'not configured',
    port: SMTP_PORT,
    from: SMTP_FROM,
    adminEmail: ADMIN_EMAIL
  }
}

/**
 * Queue email for background processing
 */
export async function queueEmail(options: EmailOptions, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
  // In a real implementation, you would use a queue system like Bull, Agenda, or AWS SQS
  // For now, we'll just send the email immediately
  console.log(`Queueing email with priority ${priority}:`, options.subject)
  await sendEmail(options)
}

// Export email template types for type safety
export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES
export type EmailLanguage = 'de' | 'fr' | 'pl' | 'en'