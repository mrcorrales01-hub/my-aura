import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENHANCED-CREATE-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  priceId?: string;
  planType: 'premium_monthly' | 'premium_yearly' | 'enterprise';
  paymentMethods?: string[];
  countryCode?: string;
}

const SUBSCRIPTION_PLANS = {
  premium_monthly: {
    amount: 1999, // $19.99
    currency: 'usd',
    interval: 'month' as const,
    name: 'My Aura Premium Monthly',
    description: 'Unlimited AI coaching, advanced analytics, and premium features'
  },
  premium_yearly: {
    amount: 19999, // $199.99 (save ~17%)
    currency: 'usd', 
    interval: 'year' as const,
    name: 'My Aura Premium Yearly',
    description: 'Unlimited AI coaching, advanced analytics, premium features - Save 17%!'
  },
  enterprise: {
    amount: 4999, // $49.99
    currency: 'usd',
    interval: 'month' as const,
    name: 'My Aura Enterprise',
    description: 'Everything in Premium plus team features and priority support'
  }
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

    const { planType, paymentMethods = ['card'], countryCode }: CheckoutRequest = await req.json();
    
    if (!SUBSCRIPTION_PLANS[planType]) {
      throw new Error("Invalid plan type");
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    logStep("Plan selected", { planType, plan });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://ad75c518-0b07-43a9-ab8c-a632301b859c.lovableproject.com";
    
    // Configure payment methods based on country and availability
    let allowedPaymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card'];
    
    if (paymentMethods.includes('paypal')) {
      allowedPaymentMethods.push('paypal');
    }
    if (paymentMethods.includes('klarna') && ['US', 'GB', 'DE', 'SE'].includes(countryCode || 'US')) {
      allowedPaymentMethods.push('klarna');
    }
    if (paymentMethods.includes('swish') && countryCode === 'SE') {
      // Swish is Sweden-specific
      // Note: Swish may require special Stripe configuration
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: { 
              name: plan.name,
              description: plan.description,
              images: [`${origin}/aura-logo.png`] // Add your logo URL
            },
            unit_amount: plan.amount,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
      cancel_url: `${origin}/payment-cancel?plan=${planType}`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_method_types: allowedPaymentMethods,
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType
        }
      },
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_type: planType
      }
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update subscriber record
    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscription_tier: planType,
      country_code: countryCode,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      planType,
      paymentMethods: allowedPaymentMethods 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in enhanced-create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});