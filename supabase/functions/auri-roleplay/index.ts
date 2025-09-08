import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RoleplayScenario {
  id: string;
  title: Record<string, string>;
  persona: string;
  languageStyle: string;
  steps: Array<{
    id: number;
    goal: Record<string, string>;
    hints: Record<string, string[]>;
    rubric: string;
  }>;
}

// Hardcoded scenarios for now - in production these would come from database
const scenarios: RoleplayScenario[] = [
  {
    id: 'boundary-setting',
    title: {
      sv: 'Sätta gränser',
      en: 'Setting Boundaries',
      es: 'Establecer Límites',
      no: 'Sette grenser',
      da: 'Sætte grænser',
      fi: 'Rajojen asettaminen'
    },
    persona: 'You are Auri, a supportive wellness coach helping someone practice setting healthy boundaries. You are empathetic, encouraging, and provide realistic scenarios.',
    languageStyle: 'Simple, warm, 2–3 sentences per turn. Ask open-ended questions to guide reflection.',
    steps: [
      {
        id: 1,
        goal: {
          sv: 'Identifiera situationen där gränser behövs',
          en: 'Identify the situation where boundaries are needed',
          es: 'Identificar la situación donde se necesitan límites',
          no: 'Identifiser situasjonen der grenser trengs',
          da: 'Identificer situationen hvor grænser er nødvendige',
          fi: 'Tunnista tilanne jossa rajoja tarvitaan'
        },
        hints: {
          sv: ['Fråga om specifika exempel', 'Utforska känslor kring situationen'],
          en: ['Ask for specific examples', 'Explore feelings about the situation'],
          es: ['Pide ejemplos específicos', 'Explora sentimientos sobre la situación'],
          no: ['Spør om spesifikke eksempler', 'Utforsk følelser rundt situasjonen'],
          da: ['Spørg om specifikke eksempler', 'Udforsk følelser omkring situationen'],
          fi: ['Kysy konkreettisia esimerkkejä', 'Tutki tunteita tilanteesta']
        },
        rubric: 'Score 0-5 based on clarity of situation identification, emotional awareness, and specificity of examples provided.'
      },
      {
        id: 2,
        goal: {
          sv: 'Formulera tydliga gränser',
          en: 'Formulate clear boundaries',
          es: 'Formular límites claros',
          no: 'Formuler klare grenser',
          da: 'Formuler klare grænser',
          fi: 'Muotoile selkeät rajat'
        },
        hints: {
          sv: ['Använd "jag"-meddelanden', 'Var specifik och tydlig'],
          en: ['Use "I" statements', 'Be specific and clear'],
          es: ['Usa declaraciones "yo"', 'Sé específico y claro'],
          no: ['Bruk "jeg"-utsagn', 'Vær spesifikk og tydelig'],
          da: ['Brug "jeg"-udsagn', 'Vær specifik og klar'],
          fi: ['Käytä "minä"-lauseita', 'Ole tarkka ja selkeä']
        },
        rubric: 'Score 0-5 based on clarity of boundary statement, use of assertive language, and appropriateness to the situation.'
      }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check mode - no token spend
  const url = new URL(req.url);
  if (url.searchParams.get('mode') === 'health') {
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

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scenarioId, step, transcript, lang = 'en' } = await req.json();
    
    if (!scenarioId || step === undefined || !transcript) {
      throw new Error('Missing required fields: scenarioId, step, transcript');
    }

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const currentStep = scenario.steps.find(s => s.id === step);
    if (!currentStep) {
      throw new Error(`Step not found: ${step}`);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Demo mode if no API key
    if (!openaiApiKey) {
      const demoResponse = lang === 'sv' 
        ? 'Demo-läge: Rollspelscoach aktiverad. Lägg till OpenAI API-nyckel för full funktionalitet.'
        : 'Demo mode: Roleplay coach activated. Add OpenAI API key for full functionality.';

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const tokenData = `data: ${JSON.stringify({ type: 'token', content: demoResponse })}\n\n`;
          controller.enqueue(encoder.encode(tokenData));
          
          const resultData = `data: ${JSON.stringify({ 
            type: 'step_result', 
            stepScore: 3, 
            coachNote: 'Demo feedback', 
            nextStep: step < scenario.steps.length ? step + 1 : null, 
            finished: step >= scenario.steps.length 
          })}\n\n`;
          controller.enqueue(encoder.encode(resultData));
          
          const doneData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
          controller.enqueue(encoder.encode(doneData));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'x-demo-mode': '1' },
      });
    }

    // Build system prompt for roleplay
    const stepGoal = currentStep.goal[lang] || currentStep.goal.en;
    const systemPrompt = `${scenario.persona}

Current step goal: ${stepGoal}

${scenario.languageStyle}

Evaluation rubric for this step: ${currentStep.rubric}

Respond in ${lang === 'sv' ? 'Swedish' : lang === 'es' ? 'Spanish' : lang === 'no' ? 'Norwegian' : lang === 'da' ? 'Danish' : lang === 'fi' ? 'Finnish' : 'English'}.

After the conversation, you will need to evaluate the user's performance on this step and provide a score (0-5) and brief coaching note.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...transcript.slice(-10) // Keep last 10 messages for context
    ];

    // Call OpenAI streaming API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${openAiResponse.status}`);
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = openAiResponse.body?.getReader();
          if (!reader) throw new Error('No response body');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Generate step score and coach note
                  const stepScore = Math.floor(Math.random() * 3) + 3; // Demo scoring 3-5
                  const coachNote = lang === 'sv' 
                    ? 'Bra jobbat! Fortsätt utveckla dina färdigheter.'
                    : 'Good work! Keep developing your skills.';
                  
                  const nextStep = step < scenario.steps.length ? step + 1 : null;
                  const finished = step >= scenario.steps.length;

                  // Save messages to database
                  try {
                    if (transcript.length > 0) {
                      const lastUserMessage = transcript[transcript.length - 1];
                      if (lastUserMessage.role === 'user') {
                        await supabaseClient
                          .from('messages')
                          .insert({
                            user_id: user.id,
                            session_id: null,
                            role: 'user',
                            content: lastUserMessage.content,
                            language: lang
                          });
                      }
                    }

                    if (fullResponse.trim()) {
                      await supabaseClient
                        .from('messages')
                        .insert({
                          user_id: user.id,
                          session_id: null,
                          role: 'assistant',
                          content: fullResponse.trim(),
                          language: lang
                        });
                    }
                  } catch (dbError) {
                    console.error('Database save error:', dbError);
                  }

                  const resultData = `data: ${JSON.stringify({ 
                    type: 'step_result', 
                    stepScore, 
                    coachNote, 
                    nextStep, 
                    finished 
                  })}\n\n`;
                  controller.enqueue(encoder.encode(resultData));
                  
                  const doneData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
                  controller.enqueue(encoder.encode(doneData));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    const tokenData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
                    controller.enqueue(encoder.encode(tokenData));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Error in auri-roleplay:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
