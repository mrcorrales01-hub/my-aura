// deno
import 'jsr:@supabase/functions-js/edge-runtime'
import OpenAI from 'https://esm.sh/openai@4.55.3'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  
  const url = new URL(req.url); 
  if (url.searchParams.get('mode') === 'health')
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'content-type': 'application/json' } })

  const auth = req.headers.get('authorization') ?? ''; 
  const apikey = Deno.env.get('OPENAI_API_KEY') ?? ''
  if (!apikey) return new Response(JSON.stringify({ error: 'no-openai-key' }), { status: 500, headers: cors })

  const { messages = [], lang = 'sv' } = await req.json().catch(() => ({ messages: [], lang: 'sv' }))
  // Keep only last 12 to cut repetition/length
  const recent = messages.slice(-12)

  const system = `You are Auri, a practical, warm AI coach.
- Reply in ${lang}.
- Structure EVERY reply:
  1) one-sentence empathy (≤20 words),
  2) ACTION PLAN: exactly 3 numbered steps, concrete and personalized,
  3) ONE focused follow-up question.
- Absolutely avoid repeating previous wording. Vary verbs and structure.
- No medical diagnosis. If crisis intent -> instruct to open Crisis page.`

  const client = new OpenAI({ apiKey: apikey })
  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4, 
    top_p: 0.9, 
    presence_penalty: 0.8, 
    frequency_penalty: 0.6,
    stream: true,
    messages: [{ role: 'system', content: system }, ...recent]
  })

  const rs = new ReadableStream({
    async start(c) {
      const enc = new TextEncoder(); 
      for await (const ch of stream) {
        const t = ch.choices?.[0]?.delta?.content ?? ''; 
        if (t) c.enqueue(enc.encode(t))
      } 
      c.close()
    }
  })
  return new Response(rs, { headers: { ...cors, 'content-type': 'text/plain; charset=utf-8' } })
})
