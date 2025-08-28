import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  email?: string;
  attemptType: 'login' | 'signup' | 'password_reset';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, attemptType }: RateLimitRequest = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check current rate limit status
    const { data: existing, error: fetchError } = await supabaseClient
      .from('auth_rate_limits')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('attempt_type', attemptType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const maxAttempts = attemptType === 'login' ? 5 : 3; // Lower limits for signup/reset

    if (existing) {
      // Check if still blocked
      if (existing.blocked_until && new Date(existing.blocked_until) > now) {
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            reason: 'Rate limited',
            retryAfter: existing.blocked_until 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }

      // Reset counter if more than 1 hour passed
      const lastAttempt = new Date(existing.last_attempt_at);
      if (now.getTime() - lastAttempt.getTime() > oneHour) {
        await supabaseClient
          .from('auth_rate_limits')
          .update({
            attempt_count: 1,
            first_attempt_at: now.toISOString(),
            last_attempt_at: now.toISOString(),
            blocked_until: null,
            email: email || existing.email
          })
          .eq('id', existing.id);

        return new Response(
          JSON.stringify({ allowed: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment attempt count
      const newCount = existing.attempt_count + 1;
      const isBlocked = newCount >= maxAttempts;
      
      await supabaseClient
        .from('auth_rate_limits')
        .update({
          attempt_count: newCount,
          last_attempt_at: now.toISOString(),
          blocked_until: isBlocked ? new Date(now.getTime() + oneHour).toISOString() : null,
          email: email || existing.email
        })
        .eq('id', existing.id);

      if (isBlocked) {
        // Log security event
        await supabaseClient.rpc('log_security_event', {
          p_user_id: null,
          p_event_type: 'rate_limit_exceeded',
          p_table_name: 'auth_rate_limits',
          p_record_id: existing.id,
          p_details: { 
            attempt_type: attemptType, 
            ip_address: clientIP,
            email: email 
          }
        });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            reason: 'Too many attempts',
            retryAfter: new Date(now.getTime() + oneHour).toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    } else {
      // Create new rate limit record
      await supabaseClient
        .from('auth_rate_limits')
        .insert({
          ip_address: clientIP,
          email: email,
          attempt_type: attemptType,
          attempt_count: 1,
          first_attempt_at: now.toISOString(),
          last_attempt_at: now.toISOString()
        });
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});