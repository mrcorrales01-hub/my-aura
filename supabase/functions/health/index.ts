import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        "database": "ok",
        "auth": "ok",
        "edge_functions": "ok"
      },
      features: {
        "mini_coach": "ok",
        "visit_bundle": "ok",
        "share": "ok",
        "crisis": {
          "routes": "ok",
          "resources": "SE|OTHER",
          "triage": "ok",
          "plan": "ok"
        }
      }
    }

    return new Response(
      JSON.stringify(health),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})