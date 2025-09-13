import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const PRICE_PLUS = Deno.env.get("STRIPE_PRICE_PLUS")!
const PRICE_PRO = Deno.env.get("STRIPE_PRICE_PRO")!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

function planFromPriceId(priceId?: string): "plus" | "pro" | "free" {
  if (!priceId) return "free"
  if (priceId === PRICE_PRO) return "pro"
  if (priceId === PRICE_PLUS) return "plus"
  return "free"
}

async function upsertSubscriber(opts: {
  userId?: string
  customerId?: string
  subscribed: boolean
  tier: "free" | "plus" | "pro"
}) {
  const { userId, customerId, subscribed, tier } = opts
  if (!userId) return

  try {
    await admin.from("subscribers").upsert({
      user_id: userId,
      subscribed,
      subscription_tier: tier,
      stripe_customer_id: customerId ?? undefined,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" })
    
    console.log(`Updated subscriber: ${userId} -> ${tier} (${subscribed ? 'active' : 'inactive'})`)
  } catch (error) {
    console.error('Failed to upsert subscriber:', error)
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const sig = req.headers.get("stripe-signature") || ""
  const raw = await req.text()
  
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, WEBHOOK_SECRET)
  } catch (e: any) {
    console.error('Webhook signature verification failed:', e.message)
    return new Response(`Webhook Error: ${e.message}`, { status: 400 })
  }

  console.log(`Processing webhook: ${event.type}`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = (session.client_reference_id || session.metadata?.user_id) as string | undefined
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id
        
        // Get price from line items or subscription
        let priceId: string | undefined
        if (session.line_items?.data?.[0]) {
          priceId = (session.line_items.data[0] as any).price?.id
        } else if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          priceId = sub.items.data[0].price.id
        }
        
        const tier = planFromPriceId(priceId)
        await upsertSubscriber({ userId, customerId, subscribed: true, tier })
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0].price.id
        const tier = planFromPriceId(priceId)
        
        // Get userId from subscription metadata or customer metadata
        let userId = sub.metadata?.user_id
        if (!userId && typeof sub.customer === "string") {
          const customer = await stripe.customers.retrieve(sub.customer)
          userId = (customer as any).metadata?.user_id
        }
        
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id
        const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due"
        
        await upsertSubscriber({ 
          userId, 
          customerId, 
          subscribed: active, 
          tier: active ? tier : "free" 
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        
        // Get userId from subscription metadata or customer metadata
        let userId = sub.metadata?.user_id
        if (!userId && typeof sub.customer === "string") {
          const customer = await stripe.customers.retrieve(sub.customer)
          userId = (customer as any).metadata?.user_id
        }
        
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id
        
        await upsertSubscriber({ 
          userId, 
          customerId, 
          subscribed: false, 
          tier: "free" 
        })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response("Webhook processing failed", { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  })
})