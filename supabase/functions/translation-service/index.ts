import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supportedLanguages = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { text, targetLanguage, sourceLanguage = 'auto', userId, context = 'chat' } = await req.json();

    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    console.log('Translating text:', { sourceLanguage, targetLanguage, context });

    // Detect source language if not provided
    let detectedSourceLang = sourceLanguage;
    if (sourceLanguage === 'auto') {
      detectedSourceLang = await detectLanguage(text);
    }

    // Translate using OpenAI (more context-aware for therapy content)
    const translatedText = await translateWithOpenAI(text, detectedSourceLang, targetLanguage, context);

    // Save translation history if user is provided
    if (userId) {
      await supabase
        .from('translation_history')
        .insert({
          user_id: userId,
          original_text: text,
          translated_text: translatedText,
          source_language: detectedSourceLang,
          target_language: targetLanguage,
          context
        });
    }

    return new Response(JSON.stringify({
      originalText: text,
      translatedText,
      sourceLanguage: detectedSourceLang,
      targetLanguage,
      context
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in translation-service function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function detectLanguage(text: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return 'en'; // fallback
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the given text. Respond with only the ISO 639-1 language code (e.g., "en", "es", "fr").'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_completion_tokens: 10
      }),
    });

    const result = await response.json();
    const detectedLang = result.choices[0].message.content.trim().toLowerCase();
    
    return supportedLanguages[detectedLang as keyof typeof supportedLanguages] ? detectedLang : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

async function translateWithOpenAI(text: string, sourceLang: string, targetLang: string, context: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const contextInstructions = {
    'chat': 'This is a therapeutic chat conversation. Maintain empathetic and professional tone.',
    'video': 'This is from a video therapy session. Preserve the conversational flow and emotional context.',
    'session_notes': 'These are therapy session notes. Maintain clinical accuracy and professional terminology.'
  };

  const systemPrompt = `You are a professional medical translator specializing in mental health and therapy content. 
  
  Context: ${contextInstructions[context as keyof typeof contextInstructions] || contextInstructions.chat}
  
  Translate the following text from ${supportedLanguages[sourceLang as keyof typeof supportedLanguages] || sourceLang} to ${supportedLanguages[targetLang as keyof typeof supportedLanguages] || targetLang}.
  
  Important guidelines:
  - Preserve emotional tone and therapeutic context
  - Use culturally appropriate expressions
  - Maintain professional medical terminology where applicable
  - Keep the same level of formality
  - Ensure the translation is natural and fluent
  
  Respond with only the translation, no additional text.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_completion_tokens: Math.min(2000, text.length * 2)
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Translation API error: ${error}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}