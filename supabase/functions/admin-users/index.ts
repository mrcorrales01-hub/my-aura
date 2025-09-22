/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_ALLOWLIST = (Deno.env.get("ADMIN_ALLOWLIST")||"").split(",").map(s=>s.trim().toLowerCase());
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function isAllowed(email?: string|null){
  if(!email) return false;
  return ADMIN_ALLOWLIST.includes(email.toLowerCase());
}

// Mask UUID/email → 8 characters
function maskId(s: string){ return s?.replace(/[^a-zA-Z0-9]/g,'').slice(0,8) || "anon"; }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const bearer = req.headers.get("Authorization")?.replace("Bearer ","") || "";
    const { data: ures } = await admin.auth.getUser(bearer);
    const email = ures?.user?.email || null;
    
    if(!isAllowed(email)) {
      return new Response(JSON.stringify({ error:"forbidden" }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Pull anonymized stats from public tables only
    // profiles.id = auth.users.id (UUID), but we never return emails.
    const { data: profiles } = await admin.from("profiles")
      .select("id, created_at, display_name")
      .limit(2000);

    const ids = (profiles||[]).map(x=>x.id);

    // Helper: count last 7 days per table
    const since7 = new Date(Date.now()-7*86400000).toISOString();

    // conversations (messages)
    const { data: convs } = await admin.from("conversations")
      .select("user_id, created_at")
      .gte("created_at", since7)
      .limit(50000);

    // mood_entries
    const { data: moods } = await admin.from("mood_entries")
      .select("user_id, created_at, mood_value")
      .gte("created_at", since7)
      .limit(50000);

    // ai_role_sessions (roleplay)
    const { data: rpr } = await admin.from("ai_role_sessions")
      .select("user_id, started_at")
      .gte("started_at", since7)
      .limit(50000);

    // subscribers (plan)
    const { data: subs } = await admin.from("subscribers")
      .select("user_id, subscribed, subscription_tier, updated_at")
      .limit(50000);

    // last activity: union of few tables (approx)
    const lastMap = new Map<string,string>();
    function note(id:string, ts?:string|null){
      if(!id||!ts) return;
      const prev = lastMap.get(id);
      if(!prev || new Date(ts) > new Date(prev)) lastMap.set(id, ts);
    }

    (convs||[]).forEach(c=>note(c.user_id as string, c.created_at as any));
    (moods||[]).forEach(m=>note(m.user_id as string, m.created_at as any));
    (rpr||[]).forEach(r=>note(r.user_id as string, r.started_at as any));

    // Aggregate
    const subMap = new Map<string,{tier:string,subscribed:boolean,updated_at?:string|null}>();
    (subs||[]).forEach(s=>subMap.set(s.user_id as string, { 
      tier: (s.subscription_tier||'free') as string, 
      subscribed: !!s.subscribed, 
      updated_at: s.updated_at 
    }));

    const msgsCount = new Map<string,number>();
    (convs||[]).forEach(c=>msgsCount.set(c.user_id, (msgsCount.get(c.user_id)||0)+1));

    const moodCount = new Map<string,number>();
    (moods||[]).forEach(m=>moodCount.set(m.user_id, (moodCount.get(m.user_id)||0)+1));

    const rpCount = new Map<string,number>();
    (rpr||[]).forEach(r=>rpCount.set(r.user_id, (rpCount.get(r.user_id)||0)+1));

    const rows = (profiles||[]).map(p=>{
      const id = p.id as string;
      const sub = subMap.get(id);
      const plan = sub?.tier || 'free';
      return {
        id_mask: maskId(id),
        plan,
        created_at: p.created_at,
        last_active: lastMap.get(id) || null,
        msgs_7d: msgsCount.get(id)||0,
        moods_7d: moodCount.get(id)||0,
        roleplay_7d: rpCount.get(id)||0
      }
    });

    return new Response(JSON.stringify({ rows }), { 
      headers: { ...corsHeaders, "Content-Type":"application/json" } 
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});