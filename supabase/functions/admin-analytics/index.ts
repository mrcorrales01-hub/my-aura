import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-ANALYTICS] ${step}${detailsStr}`);
};

// Admin access validation - in production, implement proper admin role checking
const isAdminUser = (email?: string): boolean => {
  const adminEmails = Deno.env.get("ADMIN_EMAILS")?.split(',') || [];
  return adminEmails.includes(email || '');
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
    logStep("Admin analytics request started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.email || !isAdminUser(user.email)) {
      throw new Error("Unauthorized - Admin access required");
    }

    logStep("Admin user authenticated", { email: user.email });

    const url = new URL(req.url);
    const dateRange = url.searchParams.get('range') || '7'; // Default to 7 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get payment analytics from database
    const { data: analyticsData, error: analyticsError } = await supabaseClient
      .from('payment_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (analyticsError) {
      throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
    }

    // Get current active subscribers
    const { data: activeSubscribers, error: subscribersError } = await supabaseClient
      .from('subscribers')
      .select('subscription_tier, created_at, country_code')
      .eq('subscribed', true);

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    // Get recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabaseClient
      .from('pay_per_play_transactions')
      .select('content_type, amount_cents, payment_status, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`);
    }

    // Calculate summary statistics
    const totalRevenue = analyticsData.reduce((sum, day) => sum + (day.total_revenue_cents || 0), 0);
    const subscriptionRevenue = analyticsData.reduce((sum, day) => sum + (day.subscription_revenue_cents || 0), 0);
    const payPerPlayRevenue = analyticsData.reduce((sum, day) => sum + (day.pay_per_play_revenue_cents || 0), 0);
    
    // Group subscribers by tier
    const subscribersByTier = activeSubscribers?.reduce((acc: any, sub: any) => {
      acc[sub.subscription_tier] = (acc[sub.subscription_tier] || 0) + 1;
      return acc;
    }, {}) || {};

    // Calculate churn rate (simplified)
    const totalNewSubscribers = analyticsData.reduce((sum, day) => sum + (day.new_subscribers || 0), 0);
    const totalChurnedSubscribers = analyticsData.reduce((sum, day) => sum + (day.churned_subscribers || 0), 0);
    const churnRate = totalNewSubscribers > 0 ? (totalChurnedSubscribers / totalNewSubscribers) * 100 : 0;

    // Payment method breakdown (simplified - would need Stripe data for full accuracy)
    const paymentMethodBreakdown = {
      stripe: analyticsData.reduce((sum, day) => sum + (day.stripe_transactions || 0), 0),
      apple: analyticsData.reduce((sum, day) => sum + (day.apple_transactions || 0), 0),
      google: analyticsData.reduce((sum, day) => sum + (day.google_transactions || 0), 0),
    };

    // Geographic distribution
    const geographicDistribution = activeSubscribers?.reduce((acc: any, sub: any) => {
      const country = sub.country_code || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) || {};

    const analyticsResponse = {
      summary: {
        totalRevenue: Math.round(totalRevenue / 100 * 100) / 100, // Convert to dollars
        subscriptionRevenue: Math.round(subscriptionRevenue / 100 * 100) / 100,
        payPerPlayRevenue: Math.round(payPerPlayRevenue / 100 * 100) / 100,
        activeSubscribers: activeSubscribers?.length || 0,
        churnRate: Math.round(churnRate * 100) / 100,
        newSubscribers: totalNewSubscribers,
        churned: totalChurnedSubscribers
      },
      subscribersByTier,
      paymentMethodBreakdown,
      geographicDistribution,
      dailyAnalytics: analyticsData?.map(day => ({
        ...day,
        total_revenue_dollars: Math.round(day.total_revenue_cents / 100 * 100) / 100,
        subscription_revenue_dollars: Math.round(day.subscription_revenue_cents / 100 * 100) / 100,
        pay_per_play_revenue_dollars: Math.round(day.pay_per_play_revenue_cents / 100 * 100) / 100,
      })) || [],
      recentTransactions: recentTransactions?.map(tx => ({
        ...tx,
        amount_dollars: Math.round(tx.amount_cents / 100 * 100) / 100,
      })) || []
    };

    logStep("Analytics data compiled", { 
      dateRange, 
      totalRevenue: analyticsResponse.summary.totalRevenue,
      activeSubscribers: analyticsResponse.summary.activeSubscribers 
    });

    return new Response(JSON.stringify(analyticsResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-analytics", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});