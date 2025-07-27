import { ContactCategory, Language } from "@/lib/database.types"

// Contact form translations
export const contactTranslations = {
  [Language.DE]: {
    // Contact categories
    categories: {
      [ContactCategory.GENERAL_INQUIRY]: {
        name: "Allgemeine Anfrage",
        description: "Allgemeine Fragen zu MotoAuto.ch"
      },
      [ContactCategory.LISTING_INQUIRY]: {
        name: "Fahrzeug-Anfrage",
        description: "Fragen zu einem bestimmten Fahrzeug"
      },
      [ContactCategory.TECHNICAL_SUPPORT]: {
        name: "Technischer Support",
        description: "Technische Probleme und Fehlermeldungen"
      },
      [ContactCategory.BILLING_SUPPORT]: {
        name: "Rechnungs-Support",
        description: "Fragen zu Zahlungen und Rechnungen"
      },
      [ContactCategory.ACCOUNT_ISSUES]: {
        name: "Konto-Probleme",
        description: "Probleme mit Ihrem Benutzerkonto"
      },
      [ContactCategory.PARTNERSHIP]: {
        name: "Partnerschaft",
        description: "Geschäftspartnerschaft und Kooperationen"
      },
      [ContactCategory.LEGAL_COMPLIANCE]: {
        name: "Rechtliches",
        description: "Rechtliche Fragen und Compliance"
      }
    },
    
    // Form labels and placeholders
    form: {
      name: {
        label: "Name",
        placeholder: "Ihr vollständiger Name",
        error: "Bitte geben Sie Ihren Namen ein"
      },
      email: {
        label: "E-Mail-Adresse",
        placeholder: "ihre.email@beispiel.com",
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
      },
      phone: {
        label: "Telefonnummer (optional)",
        placeholder: "+41 XX XXX XX XX",
        error: "Bitte geben Sie eine gültige Telefonnummer ein"
      },
      subject: {
        label: "Betreff",
        placeholder: "Worum geht es in Ihrer Anfrage?",
        error: "Bitte geben Sie einen Betreff ein"
      },
      message: {
        label: "Nachricht",
        placeholder: "Beschreiben Sie Ihr Anliegen ausführlich...",
        error: "Bitte geben Sie eine Nachricht ein"
      },
      category: {
        label: "Kategorie",
        placeholder: "Wählen Sie eine Kategorie",
        error: "Bitte wählen Sie eine Kategorie"
      },
      recaptcha: {
        error: "Bitte bestätigen Sie, dass Sie kein Roboter sind"
      }
    },
    
    // Buttons and actions
    actions: {
      submit: "Nachricht senden",
      submitting: "Wird gesendet...",
      cancel: "Abbrechen",
      reset: "Zurücksetzen"
    },
    
    // Success and error messages
    messages: {
      success: {
        title: "Nachricht gesendet!",
        description: "Vielen Dank für Ihre Nachricht. Wir werden uns schnellstmöglich bei Ihnen melden."
      },
      error: {
        title: "Fehler beim Senden",
        description: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
        rateLimitExceeded: "Sie haben zu viele Nachrichten gesendet. Bitte warten Sie, bevor Sie eine weitere Nachricht senden.",
        spamDetected: "Ihre Nachricht wurde als Spam erkannt. Bitte überprüfen Sie den Inhalt.",
        recaptchaFailed: "reCAPTCHA-Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        serverError: "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      }
    },
    
    // Email templates
    email: {
      confirmation: {
        subject: "Bestätigung Ihrer Kontaktanfrage - MotoAuto.ch",
        greeting: "Liebe/r {name},",
        body: "vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.",
        footer: "Mit freundlichen Grüßen,\nIhr MotoAuto.ch Team"
      },
      listingInquiry: {
        subject: "Neue Anfrage zu Ihrem Fahrzeug - MotoAuto.ch",
        greeting: "Hallo {ownerName},",
        body: "Sie haben eine neue Anfrage zu Ihrem Fahrzeug erhalten.",
        footer: "Sie können direkt auf diese E-Mail antworten, um mit dem Interessenten in Kontakt zu treten."
      }
    }
  },
  
  [Language.FR]: {
    // Contact categories
    categories: {
      [ContactCategory.GENERAL_INQUIRY]: {
        name: "Demande générale",
        description: "Questions générales sur MotoAuto.ch"
      },
      [ContactCategory.LISTING_INQUIRY]: {
        name: "Demande véhicule",
        description: "Questions sur un véhicule spécifique"
      },
      [ContactCategory.TECHNICAL_SUPPORT]: {
        name: "Support technique",
        description: "Problèmes techniques et messages d'erreur"
      },
      [ContactCategory.BILLING_SUPPORT]: {
        name: "Support facturation",
        description: "Questions sur les paiements et factures"
      },
      [ContactCategory.ACCOUNT_ISSUES]: {
        name: "Problèmes de compte",
        description: "Problèmes avec votre compte utilisateur"
      },
      [ContactCategory.PARTNERSHIP]: {
        name: "Partenariat",
        description: "Partenariat commercial et coopérations"
      },
      [ContactCategory.LEGAL_COMPLIANCE]: {
        name: "Juridique",
        description: "Questions juridiques et conformité"
      }
    },
    
    // Form labels and placeholders
    form: {
      name: {
        label: "Nom",
        placeholder: "Votre nom complet",
        error: "Veuillez saisir votre nom"
      },
      email: {
        label: "Adresse e-mail",
        placeholder: "votre.email@exemple.com",
        error: "Veuillez saisir une adresse e-mail valide"
      },
      phone: {
        label: "Numéro de téléphone (optionnel)",
        placeholder: "+41 XX XXX XX XX",
        error: "Veuillez saisir un numéro de téléphone valide"
      },
      subject: {
        label: "Sujet",
        placeholder: "De quoi s'agit-il dans votre demande?",
        error: "Veuillez saisir un sujet"
      },
      message: {
        label: "Message",
        placeholder: "Décrivez votre demande en détail...",
        error: "Veuillez saisir un message"
      },
      category: {
        label: "Catégorie",
        placeholder: "Choisissez une catégorie",
        error: "Veuillez choisir une catégorie"
      },
      recaptcha: {
        error: "Veuillez confirmer que vous n'êtes pas un robot"
      }
    },
    
    // Buttons and actions
    actions: {
      submit: "Envoyer le message",
      submitting: "Envoi en cours...",
      cancel: "Annuler",
      reset: "Réinitialiser"
    },
    
    // Success and error messages
    messages: {
      success: {
        title: "Message envoyé!",
        description: "Merci pour votre message. Nous vous répondrons dans les plus brefs délais."
      },
      error: {
        title: "Erreur d'envoi",
        description: "Votre message n'a pas pu être envoyé. Veuillez réessayer plus tard.",
        rateLimitExceeded: "Vous avez envoyé trop de messages. Veuillez attendre avant d'envoyer un autre message.",
        spamDetected: "Votre message a été détecté comme spam. Veuillez vérifier le contenu.",
        recaptchaFailed: "Échec de la vérification reCAPTCHA. Veuillez réessayer.",
        serverError: "Une erreur serveur s'est produite. Veuillez réessayer plus tard."
      }
    },
    
    // Email templates
    email: {
      confirmation: {
        subject: "Confirmation de votre demande de contact - MotoAuto.ch",
        greeting: "Cher/Chère {name},",
        body: "merci pour votre demande de contact. Nous avons reçu votre message et vous répondrons dans les plus brefs délais.",
        footer: "Cordialement,\nL'équipe MotoAuto.ch"
      },
      listingInquiry: {
        subject: "Nouvelle demande pour votre véhicule - MotoAuto.ch",
        greeting: "Bonjour {ownerName},",
        body: "Vous avez reçu une nouvelle demande pour votre véhicule.",
        footer: "Vous pouvez répondre directement à cet e-mail pour contacter l'intéressé."
      }
    }
  },
  
  [Language.PL]: {
    // Contact categories
    categories: {
      [ContactCategory.GENERAL_INQUIRY]: {
        name: "Zapytanie ogólne",
        description: "Ogólne pytania dotyczące MotoAuto.ch"
      },
      [ContactCategory.LISTING_INQUIRY]: {
        name: "Zapytanie o pojazd",
        description: "Pytania dotyczące konkretnego pojazdu"
      },
      [ContactCategory.TECHNICAL_SUPPORT]: {
        name: "Wsparcie techniczne",
        description: "Problemy techniczne i komunikaty błędów"
      },
      [ContactCategory.BILLING_SUPPORT]: {
        name: "Wsparcie rozliczeniowe",
        description: "Pytania dotyczące płatności i faktur"
      },
      [ContactCategory.ACCOUNT_ISSUES]: {
        name: "Problemy z kontem",
        description: "Problemy z Twoim kontem użytkownika"
      },
      [ContactCategory.PARTNERSHIP]: {
        name: "Partnerstwo",
        description: "Partnerstwo biznesowe i współpraca"
      },
      [ContactCategory.LEGAL_COMPLIANCE]: {
        name: "Sprawy prawne",
        description: "Pytania prawne i zgodność"
      }
    },
    
    // Form labels and placeholders
    form: {
      name: {
        label: "Imię i nazwisko",
        placeholder: "Twoje pełne imię i nazwisko",
        error: "Proszę podać swoje imię i nazwisko"
      },
      email: {
        label: "Adres e-mail",
        placeholder: "twoj.email@przyklad.com",
        error: "Proszę podać prawidłowy adres e-mail"
      },
      phone: {
        label: "Numer telefonu (opcjonalnie)",
        placeholder: "+41 XX XXX XX XX",
        error: "Proszę podać prawidłowy numer telefonu"
      },
      subject: {
        label: "Temat",
        placeholder: "Czego dotyczy Twoje zapytanie?",
        error: "Proszę podać temat"
      },
      message: {
        label: "Wiadomość",
        placeholder: "Opisz szczegółowo swoją sprawę...",
        error: "Proszę napisać wiadomość"
      },
      category: {
        label: "Kategoria",
        placeholder: "Wybierz kategorię",
        error: "Proszę wybrać kategorię"
      },
      recaptcha: {
        error: "Proszę potwierdzić, że nie jesteś robotem"
      }
    },
    
    // Buttons and actions
    actions: {
      submit: "Wyślij wiadomość",
      submitting: "Wysyłanie...",
      cancel: "Anuluj",
      reset: "Resetuj"
    },
    
    // Success and error messages
    messages: {
      success: {
        title: "Wiadomość wysłana!",
        description: "Dziękujemy za wiadomość. Odpowiemy najszybciej jak to możliwe."
      },
      error: {
        title: "Błąd wysyłania",
        description: "Twoja wiadomość nie mogła zostać wysłana. Spróbuj ponownie później.",
        rateLimitExceeded: "Wysłałeś zbyt wiele wiadomości. Poczekaj przed wysłaniem kolejnej.",
        spamDetected: "Twoja wiadomość została oznaczona jako spam. Sprawdź treść.",
        recaptchaFailed: "Weryfikacja reCAPTCHA nie powiodła się. Spróbuj ponownie.",
        serverError: "Wystąpił błąd serwera. Spróbuj ponownie później."
      }
    },
    
    // Email templates
    email: {
      confirmation: {
        subject: "Potwierdzenie Twojego zapytania - MotoAuto.ch",
        greeting: "Drogi/a {name},",
        body: "dziękujemy za zapytanie kontaktowe. Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.",
        footer: "Z poważaniem,\nZespół MotoAuto.ch"
      },
      listingInquiry: {
        subject: "Nowe zapytanie o Twój pojazd - MotoAuto.ch",
        greeting: "Cześć {ownerName},",
        body: "Otrzymałeś nowe zapytanie o swój pojazd.",
        footer: "Możesz odpowiedzieć bezpośrednio na ten e-mail, aby skontaktować się z zainteresowanym."
      }
    }
  },
  
  [Language.EN]: {
    // Contact categories
    categories: {
      [ContactCategory.GENERAL_INQUIRY]: {
        name: "General Inquiry",
        description: "General questions about MotoAuto.ch"
      },
      [ContactCategory.LISTING_INQUIRY]: {
        name: "Vehicle Inquiry",
        description: "Questions about a specific vehicle"
      },
      [ContactCategory.TECHNICAL_SUPPORT]: {
        name: "Technical Support",
        description: "Technical issues and error messages"
      },
      [ContactCategory.BILLING_SUPPORT]: {
        name: "Billing Support",
        description: "Questions about payments and invoices"
      },
      [ContactCategory.ACCOUNT_ISSUES]: {
        name: "Account Issues",
        description: "Problems with your user account"
      },
      [ContactCategory.PARTNERSHIP]: {
        name: "Partnership",
        description: "Business partnership and cooperation"
      },
      [ContactCategory.LEGAL_COMPLIANCE]: {
        name: "Legal & Compliance",
        description: "Legal questions and compliance matters"
      }
    },
    
    // Form labels and placeholders
    form: {
      name: {
        label: "Name",
        placeholder: "Your full name",
        error: "Please enter your name"
      },
      email: {
        label: "Email Address",
        placeholder: "your.email@example.com",
        error: "Please enter a valid email address"
      },
      phone: {
        label: "Phone Number (optional)",
        placeholder: "+41 XX XXX XX XX",
        error: "Please enter a valid phone number"
      },
      subject: {
        label: "Subject",
        placeholder: "What is your inquiry about?",
        error: "Please enter a subject"
      },
      message: {
        label: "Message",
        placeholder: "Describe your inquiry in detail...",
        error: "Please enter a message"
      },
      category: {
        label: "Category",
        placeholder: "Choose a category",
        error: "Please choose a category"
      },
      recaptcha: {
        error: "Please confirm you are not a robot"
      }
    },
    
    // Buttons and actions
    actions: {
      submit: "Send Message",
      submitting: "Sending...",
      cancel: "Cancel",
      reset: "Reset"
    },
    
    // Success and error messages
    messages: {
      success: {
        title: "Message Sent!",
        description: "Thank you for your message. We will get back to you as soon as possible."
      },
      error: {
        title: "Sending Error",
        description: "Your message could not be sent. Please try again later.",
        rateLimitExceeded: "You have sent too many messages. Please wait before sending another message.",
        spamDetected: "Your message was flagged as spam. Please check the content.",
        recaptchaFailed: "reCAPTCHA verification failed. Please try again.",
        serverError: "A server error occurred. Please try again later."
      }
    },
    
    // Email templates
    email: {
      confirmation: {
        subject: "Contact Request Confirmation - MotoAuto.ch",
        greeting: "Dear {name},",
        body: "thank you for your contact request. We have received your message and will get back to you as soon as possible.",
        footer: "Best regards,\nThe MotoAuto.ch Team"
      },
      listingInquiry: {
        subject: "New Inquiry About Your Vehicle - MotoAuto.ch",
        greeting: "Hello {ownerName},",
        body: "You have received a new inquiry about your vehicle.",
        footer: "You can reply directly to this email to contact the interested party."
      }
    }
  }
}

/**
 * Get translations for a specific language
 */
export function getContactTranslations(language: string) {
  const lang = language as keyof typeof contactTranslations
  return contactTranslations[lang] || contactTranslations['de']
}

/**
 * Get category translations for all languages
 */
export function getCategoryTranslations() {
  return Object.values(ContactCategory).map(category => ({
    key: category,
    name_en: contactTranslations[Language.EN].categories[category].name,
    name_de: contactTranslations[Language.DE].categories[category].name,
    name_fr: contactTranslations[Language.FR].categories[category].name,
    name_pl: contactTranslations[Language.PL].categories[category].name,
    description_en: contactTranslations[Language.EN].categories[category].description,
    description_de: contactTranslations[Language.DE].categories[category].description,
    description_fr: contactTranslations[Language.FR].categories[category].description,
    description_pl: contactTranslations[Language.PL].categories[category].description,
  }))
}

/**
 * Get localized category name
 */
export function getCategoryName(category: keyof typeof ContactCategory, language: string): string {
  const lang = language as keyof typeof contactTranslations
  const translations = contactTranslations[lang] || contactTranslations['de']
  return translations.categories[category as keyof typeof translations.categories]?.name || category
}

/**
 * Get localized error message
 */
export function getErrorMessage(errorType: string, language: string): string {
  const lang = language as keyof typeof contactTranslations
  const translations = contactTranslations[lang] || contactTranslations['de']
  
  switch (errorType) {
    case 'rate_limit_exceeded':
      return translations.messages.error.rateLimitExceeded
    case 'spam_detected':
      return translations.messages.error.spamDetected
    case 'recaptcha_failed':
      return translations.messages.error.recaptchaFailed
    case 'server_error':
      return translations.messages.error.serverError
    default:
      return translations.messages.error.description
  }
}

/**
 * Get localized success message
 */
export function getSuccessMessage(language: string) {
  const lang = language as keyof typeof contactTranslations
  const translations = contactTranslations[lang] || contactTranslations['de']
  return translations.messages.success
}

/**
 * Format email template with variables
 */
export function formatEmailTemplate(
  templateType: 'confirmation' | 'listingInquiry',
  language: string,
  variables: Record<string, any>
): { subject: string; greeting: string; body: string; footer: string } {
  const lang = language as keyof typeof contactTranslations
  const translations = contactTranslations[lang] || contactTranslations['de']
  const template = translations.email[templateType]
  
  return {
    subject: template.subject,
    greeting: template.greeting.replace(/\{(\w+)\}/g, (match: string, key: string) => variables[key] || match),
    body: template.body.replace(/\{(\w+)\}/g, (match: string, key: string) => variables[key] || match),
    footer: template.footer.replace(/\{(\w+)\}/g, (match: string, key: string) => variables[key] || match)
  }
}

// Export types for type safety
export type ContactTranslations = typeof contactTranslations['de']
export type CategoryTranslation = ContactTranslations['categories'][keyof ContactTranslations['categories']]