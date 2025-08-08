import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranslationRequest {
  text: string;
  source_language: string;
  target_languages: string[];
  table_name: string;
  record_id: string;
  field_name: string;
}

interface DeepLResponse {
  translations: Array<{
    text: string;
    detected_source_language?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { text, source_language, target_languages, table_name, record_id, field_name }: TranslationRequest = await req.json()

    // Validate input
    if (!text || !source_language || !target_languages || !table_name || !record_id || !field_name) {
      throw new Error('Missing required parameters')
    }

    // DeepL API configuration
    const deeplApiKey = Deno.env.get('DEEPL_API_KEY')
    if (!deeplApiKey) {
      throw new Error('DeepL API key not configured')
    }

    const translations: Record<string, string> = {}
    translations[source_language] = text

    // Map locale codes to DeepL language codes
    const langMap: Record<string, string> = {
      'pl': 'PL',
      'de': 'DE', 
      'fr': 'FR',
      'en': 'EN',
      'it': 'IT'
    }

    // Translate to each target language
    for (const targetLang of target_languages) {
      if (targetLang === source_language) continue

      const deeplSourceLang = langMap[source_language]
      const deeplTargetLang = langMap[targetLang]

      if (!deeplSourceLang || !deeplTargetLang) {
        console.warn(`Unsupported language pair: ${source_language} -> ${targetLang}`)
        continue
      }

      try {
        // Call DeepL API
        const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'text': text,
            'source_lang': deeplSourceLang,
            'target_lang': deeplTargetLang,
            'formality': 'default',
            'preserve_formatting': '1'
          })
        })

        if (!deeplResponse.ok) {
          console.error(`DeepL API error for ${targetLang}:`, await deeplResponse.text())
          continue
        }

        const deeplData: DeepLResponse = await deeplResponse.json()
        if (deeplData.translations && deeplData.translations.length > 0) {
          translations[targetLang] = deeplData.translations[0].text
        }
      } catch (error) {
        console.error(`Translation error for ${targetLang}:`, error)
        continue
      }
    }

    // Get current translations from database
    const { data: currentRecord, error: fetchError } = await supabaseClient
      .from(table_name)
      .select(`${field_name}_translations`)
      .eq('id', record_id)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch current record: ${fetchError.message}`)
    }

    // Merge with existing translations
    const currentTranslations = currentRecord?.[`${field_name}_translations`] || {}
    const mergedTranslations = { ...currentTranslations, ...translations }

    // Update database record
    const updateField = `${field_name}_translations`
    const { error: updateError } = await supabaseClient
      .from(table_name)
      .update({
        [updateField]: mergedTranslations
      })
      .eq('id', record_id)

    if (updateError) {
      throw new Error(`Failed to update record: ${updateError.message}`)
    }

    // Log translation activity
    const { error: logError } = await supabaseClient
      .from('translation_logs')
      .insert({
        table_name,
        record_id,
        field_name,
        source_language,
        target_languages,
        translations: mergedTranslations,
        translation_method: 'deepl_auto',
        quality_score: 0.85, // Estimated quality for DeepL
        reviewed: false,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('Failed to log translation:', logError.message)
    }

    // Calculate translation completeness
    const completeness = Math.round(
      (Object.keys(mergedTranslations).length / 5) * 100 // 5 supported languages
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        translations: mergedTranslations,
        completeness,
        translated_languages: target_languages.filter(lang => translations[lang]),
        message: `Successfully translated ${field_name} to ${Object.keys(translations).length - 1} languages`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Auto-translation error:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/* Usage example:
POST /functions/v1/auto-translate
{
  "text": "Sprzedam BMW X5 w bardzo dobrym stanie",
  "source_language": "pl",
  "target_languages": ["de", "fr", "en", "it"],
  "table_name": "listings",
  "record_id": "uuid-here", 
  "field_name": "title"
}

Response:
{
  "success": true,
  "translations": {
    "pl": "Sprzedam BMW X5 w bardzo dobrym stanie",
    "de": "BMW X5 in sehr gutem Zustand zu verkaufen",
    "fr": "BMW X5 à vendre en très bon état", 
    "en": "BMW X5 for sale in very good condition",
    "it": "BMW X5 in vendita in ottime condizioni"
  },
  "completeness": 100,
  "translated_languages": ["de", "fr", "en", "it"]
}
*/