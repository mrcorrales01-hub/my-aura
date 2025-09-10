import OpenAI from 'https://esm.sh/openai@4.55.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const ALLOWED = ['https://my-aura.lovable.app', 'https://lovable.dev'];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : 'https://my-aura.lovable.app',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? ''
})

const tools = [
  {
    type: 'function',
    function: {
      name: 'make_plan',
      description: 'Create a personalized wellness plan with steps and daily habits',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Plan title' },
          focus: { type: 'array', items: { type: 'string' }, description: 'Focus areas' },
          days: { type: 'number', description: 'Duration in days' }
        },
        required: ['title', 'focus', 'days']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_exercises',
      description: 'Suggest wellness exercises based on context and available time',
      parameters: {
        type: 'object',
        properties: {
          context: { type: 'string', description: 'Current situation or need' },
          minutes: { type: 'number', description: 'Available time in minutes' }
        },
        required: ['context', 'minutes']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'journal_hint',
      description: 'Generate a thoughtful journal prompt',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Journal topic or theme' }
        },
        required: ['topic']
      }
    }
  }
]

function executeTool(name: string, args: any) {
  switch (name) {
    case 'make_plan':
      return {
        steps: [
          `Set clear intention: ${args.title}`,
          `Focus on ${args.focus.slice(0, 2).join(' and ')} for ${args.days} days`,
          `Track progress daily with small wins`
        ],
        daily_habits: [
          `Morning check-in (2 min)`,
          `Practice ${args.focus[0]} technique (10 min)`,
          `Evening reflection (3 min)`
        ]
      }
    case 'suggest_exercises':
      const exercises = args.minutes <= 5 
        ? [{ name: 'Breathing Exercise', duration: 3 }, { name: 'Body Scan', duration: 2 }]
        : args.minutes <= 15
        ? [{ name: 'Guided Meditation', duration: 10 }, { name: 'Gratitude Practice', duration: 5 }]
        : [{ name: 'Mindful Walk', duration: 15 }, { name: 'Journaling', duration: args.minutes - 15 }]
      return { items: exercises }
    case 'journal_hint':
      return {
        prompt: `Reflect on ${args.topic}: What patterns do you notice? What would you like to change?`
      }
    default:
      return null
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  // Verify JWT authorization
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(null, { status: 401, headers: corsHeaders });
  }
  
  const url = new URL(req.url)
  if (url.searchParams.get('mode') === 'health') {
    return new Response(JSON.stringify({ ok: true, openai: !!Deno.env.get('OPENAI_API_KEY') }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }

  const apikey = Deno.env.get('OPENAI_API_KEY')
  if (!apikey) {
    return new Response(null, { 
      status: 500, headers: corsHeaders 
    })
  }

  const { messages = [], lang = 'sv', user_id } = await req.json().catch(() => ({}))
  
  // Keep only last 12 messages to manage context
  const recent = messages.slice(-12)

  const systemPrompt = `You are Auri, a practical, warm AI wellness coach.
- Reply in ${lang}.
- Structure EVERY reply:
  1) one-sentence empathy (≤18 words),
  2) ACTION PLAN: exactly 3 numbered steps, concrete and personalized,
  3) ONE focused follow-up question.
- Absolutely avoid repeating previous wording. Vary verbs and structure.
- Never give medical advice. If crisis intent -> instruct to open Crisis page.
- You may call ONE tool if helpful, then incorporate results into your 3 steps.`

  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 30000)

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...recent],
      tools: tools,
      tool_choice: 'auto',
      temperature: 0.4,
      presence_penalty: 0.8,
      frequency_penalty: 0.6,
      stream: true
    }, { signal: ctrl.signal })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let fullResponse = ''
    let toolCalls = []
    
    const rs = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta
            
            if (delta?.content) {
              fullResponse += delta.content
              controller.enqueue(encoder.encode(delta.content))
            }
            
            if (delta?.tool_calls) {
              toolCalls.push(...delta.tool_calls)
            }
          }

          // Execute tools if present
          if (toolCalls.length > 0) {
            const toolCall = toolCalls[0] // Only one tool per policy
            const result = executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments))
            if (result) {
              const toolSummary = `\n\n📋 ${JSON.stringify(result, null, 2)}`
              fullResponse += toolSummary
              controller.enqueue(encoder.encode(toolSummary))
            }
          }

          // Log to Supabase
          if (user_id && recent.length > 0) {
            const sessionId = crypto.randomUUID()
            await supabase.from('conversations').insert({
              user_id,
              message: recent[recent.length - 1]?.content || '',
              response: fullResponse,
              language_preference: lang
            })
          }

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          clearTimeout(timeout)
        }
      }
    })

    return new Response(rs, {
      headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8' }
    })
  } catch (error) {
    console.error('Auri chat error:', error)
    return new Response(null, {
      status: 500,
      headers: corsHeaders
    })
  }
})
