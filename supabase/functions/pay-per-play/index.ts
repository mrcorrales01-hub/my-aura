import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAY-PER-PLAY] ${step}${detailsStr}`);
};

interface PayPerPlayRequest {
  contentType: 'music' | 'video' | 'therapy_session';
  contentId: string;
  amount?: number; // Custom amount in cents
}

// Default pricing for pay-per-play content
const DEFAULT_PRICING = {
  music: 99, // $0.99
  video: 299, // $2.99
  therapy_session: 499, // $4.99
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { contentType, contentId, amount }: PayPerPlayRequest = await req.json();
    
    if (!contentType || !contentId) {
      throw new Error("contentType and contentId are required");
    }

    // Check if user already has premium subscription
    const { data: subscriber } = await supabaseClient
      .from('subscribers')
      .select('subscribed, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (subscriber?.subscribed && ['premium_monthly', 'premium_yearly', 'enterprise'].includes(subscriber.subscription_tier)) {
      logStep("User has premium subscription, no payment needed");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Content unlocked with premium subscription",
        requiresPayment: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user already paid for this content
    const { data: existingTransaction } = await supabaseClient
      .from('pay_per_play_transactions')
      .select('payment_status')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .eq('payment_status', 'completed')
      .single();

    if (existingTransaction) {
      logStep("User already paid for this content");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Content already unlocked",
        requiresPayment: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const finalAmount = amount || DEFAULT_PRICING[contentType];
    logStep("Processing payment", { contentType, contentId, amount: finalAmount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    // Create PaymentIntent for immediate payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        transaction_type: 'pay_per_play'
      }
    });

    // Create transaction record
    const { data: transaction } = await supabaseClient
      .from('pay_per_play_transactions')
      .insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        amount_cents: finalAmount,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .select()
      .single();

    logStep("PaymentIntent created", { 
      paymentIntentId: paymentIntent.id,
      transactionId: transaction?.id,
      amount: finalAmount 
    });

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction?.id,
      amount: finalAmount,
      requiresPayment: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in pay-per-play", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});