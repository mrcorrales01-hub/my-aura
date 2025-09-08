import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoleplayStep {
  id: string;
  goal: Record<string, string>;
  hints: Record<string, string>;
  rubric: string[];
}

interface RoleplayScenario {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  persona: string;
  languageStyle: string;
  steps: RoleplayStep[];
}

// Mock scenario data - in production, this would come from database
const scenarios: RoleplayScenario[] = [
  {
    id: 'boundary-setting',
    title: {
      sv: 'Sätta Gränser',
      en: 'Setting Boundaries', 
      es: 'Establecer Límites',
      no: 'Sette Grenser',
      da: 'Sætte Grænser',
      fi: 'Rajojen Asettaminen'
    },
    description: {
      sv: 'Lär dig att sätta hälsosamma gränser i relationer',
      en: 'Learn to set healthy boundaries in relationships',
      es: 'Aprende a establecer límites saludables en las relaciones', 
      no: 'Lær å sette sunne grenser i relasjoner',
      da: 'Lær at sætte sunde grænser i forhold',
      fi: 'Opi asettamaan terveellisiä rajoja ihmissuhteissa'
    },
    persona: 'You are Auri, a supportive communication coach specializing in healthy boundary-setting.',
    languageStyle: 'Use warm, encouraging language with specific examples and actionable steps.',
    steps: [
      {
        id: 'identify',
        goal: {
          sv: 'Identifiera när gränser behöver sättas',
          en: 'Identify when boundaries need to be set',
          es: 'Identificar cuándo se necesitan establecer límites',
          no: 'Identifiser når grenser må settes',
          da: 'Identificer hvornår grænser skal sættes',
          fi: 'Tunnista milloin rajat on asetettava'
        },
        hints: {
          sv: 'Känn efter tecken på stress, obehag eller utmattning',
          en: 'Notice signs of stress, discomfort, or exhaustion',
          es: 'Nota señales de estrés, incomodidad o agotamiento',
          no: 'Legg merke til tegn på stress, ubehag eller utmattelse', 
          da: 'Bemærk tegn på stress, ubehag eller udmattelse',
          fi: 'Huomaa stressin, epämukavuuden tai uupumuksen merkit'
        },
        rubric: ['Shows awareness of personal limits', 'Identifies specific triggers', 'Recognizes emotional responses']
      },
      {
        id: 'communicate',
        goal: {
          sv: 'Kommunicera gränsen tydligt och vänligt',
          en: 'Communicate the boundary clearly and kindly',
          es: 'Comunicar el límite de manera clara y amable',
          no: 'Kommuniser grensen tydelig og vennlig',
          da: 'Kommuniker grænsen klart og venligt', 
          fi: 'Viesti rajasta selkeästi ja ystävällisesti'
        },
        hints: {
          sv: 'Använd "Jag"-satser och var konkret om vad du behöver',
          en: 'Use "I" statements and be specific about what you need',
          es: 'Usa declaraciones con "yo" y sé específico sobre lo que necesitas',
          no: 'Bruk "jeg"-setninger og vær spesifikk om hva du trenger',
          da: 'Brug "jeg"-sætninger og vær specifik om hvad du har brug for',
          fi: 'Käytä "minä"-lauseita ja ole täsmällinen siitä, mitä tarvitset'
        },
        rubric: ['Uses clear, direct language', 'Maintains respectful tone', 'Explains reasoning when appropriate']
      }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');
    
    // Health mode
    if (mode === 'health') {
      const hasOpenAIKey = !!Deno.env.get('OPENAI_API_KEY');
      return new Response(
        JSON.stringify({ ok: true, hasOpenAIKey }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'x-demo-mode': hasOpenAIKey ? '0' : '1'
          }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { scenarioId, step, transcript, language = 'sv' } = await req.json();
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return new Response('Scenario not found', { status: 404, headers: corsHeaders });
    }

    const currentStep = scenario.steps.find(s => s.id === step);
    if (!currentStep) {
      return new Response('Step not found', { status: 404, headers: corsHeaders });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Demo mode response
    if (!openAIApiKey) {
      const demoResponse = {
        stepScore: Math.floor(Math.random() * 3) + 3, // Random score 3-5
        coachNote: {
          sv: `Demo: Bra jobbat med att ${currentStep.id === 'identify' ? 'identifiera situationen' : 'kommunicera gränser'}! Fortsätt träna.`,
          en: `Demo: Good work ${currentStep.id === 'identify' ? 'identifying the situation' : 'communicating boundaries'}! Keep practicing.`,
          es: `Demo: ¡Buen trabajo ${currentStep.id === 'identify' ? 'identificando la situación' : 'comunicando límites'}! Sigue practicando.`,
          no: `Demo: Godt jobbet med å ${currentStep.id === 'identify' ? 'identifisere situasjonen' : 'kommunisere grenser'}! Fortsett å øve.`,
          da: `Demo: Godt arbejde med at ${currentStep.id === 'identify' ? 'identificere situationen' : 'kommunikere grænser'}! Fortsæt med at øve.`,
          fi: `Demo: Hyvää työtä ${currentStep.id === 'identify' ? 'tilanteen tunnistamisessa' : 'rajojen viestinnässä'}! Jatka harjoittelua.`
        },
        nextStep: step === 'identify' ? 'communicate' : null,
        finished: step !== 'identify'
      };

      return new Response(
        `data: ${JSON.stringify({ response: JSON.stringify(demoResponse), done: true })}\n\n`,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'x-demo-mode': '1'
          },
        }
      );
    }

    // Build system prompt for OpenAI
    const systemPrompt = `${scenario.persona} ${scenario.languageStyle}
    
Current step goal: ${currentStep.goal[language]}
Evaluation rubric: ${currentStep.rubric.join(', ')}

Analyze the user's response and provide:
1. A step score (0-5) based on the rubric
2. A brief coach note in ${language} explaining the score
3. Whether to move to the next step

Response format: JSON with stepScore, coachNote, nextStep, finished fields.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        max_tokens: 300,
        temperature: 0.3,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;
        
        let fullResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(`data: ${JSON.stringify({ response: fullResponse, done: true })}\n\n`);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'x-demo-mode': '0'
      },
    });

  } catch (error) {
    console.error('Error in auri-roleplay function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});