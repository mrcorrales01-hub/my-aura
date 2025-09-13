import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

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
    const { return_url } = await req.json().catch(() => ({}))

    // Resolve Supabase user from JWT
    const { data: ures, error: uerr } = await admin.auth.getUser(auth)
    if (uerr || !ures?.user) {
      return Response.json({ error: "Unauthorized" }, { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const user = ures.user
    const userId = user.id
    const email = user.email ?? undefined

    // Find or create Stripe customer tied to this Supabase user
    let customerId: string | undefined
    const { data: subRow } = await admin.from("subscribers")
      .select("stripe_customer_id").eq("user_id", userId).maybeSingle()

    if (subRow?.stripe_customer_id) {
      customerId = subRow.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email, 
        metadata: { user_id: userId }
      })
      customerId = customer.id

      // Update subscribers table with new customer ID
      await admin.from("subscribers").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        subscribed: false,
        subscription_tier: 'free',
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: return_url || (req.headers.get("origin") || "") + "/settings/subscription?portal=1"
    })

    return Response.json({ url: session.url }, { headers: corsHeaders })

  } catch (error) {
    console.error('Portal session error:', error)
    return Response.json({ error: "Internal server error" }, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})