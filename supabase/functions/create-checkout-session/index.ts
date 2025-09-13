import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!
const STRIPE_PRICE_PLUS = Deno.env.get("STRIPE_PRICE_PLUS")!
const STRIPE_PRICE_PRO = Deno.env.get("STRIPE_PRICE_PRO")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const auth = req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    const { priceId, success_url, cancel_url } = await req.json().catch(() => ({}))
    
    if (!priceId || !success_url || !cancel_url) {
      return Response.json({ error: "Missing priceId/success_url/cancel_url" }, { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    if (![STRIPE_PRICE_PLUS, STRIPE_PRICE_PRO].includes(priceId)) {
      return Response.json({ error: "Invalid priceId" }, { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: userRes, error: userErr } = await admin.auth.getUser(auth)
    
    if (userErr || !userRes?.user) {
      return Response.json({ error: "Unauthorized" }, { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const user = userRes.user
    const userId = user.id
    const email = user.email ?? undefined

    // Reuse Stripe customer if we already have one
    let customerId: string | undefined
    const { data: subRow } = await admin.from("subscribers")
      .select("stripe_customer_id").eq("user_id", userId).maybeSingle()
    
    if (subRow?.stripe_customer_id) {
      customerId = subRow.stripe_customer_id
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      customer: customerId,
      customer_email: customerId ? undefined : email,
      client_reference_id: userId,
      metadata: { user_id: userId },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: { user_id: userId }
      }
    })

    return Response.json({ url: session.url }, { headers: corsHeaders })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json({ error: "Internal server error" }, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})