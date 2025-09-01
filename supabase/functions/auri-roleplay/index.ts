import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { script_slug, run_id, user_choice, lang = 'sv' } = await req.json();

    // Get roleplay script
    const { data: script, error: scriptError } = await supabaseClient
      .from('roleplay_scripts')
      .select('*')
      .eq('slug', script_slug)
      .eq('language', lang)
      .eq('is_active', true)
      .single();

    if (scriptError || !script) {
      console.error('Script error:', scriptError);
      return new Response(JSON.stringify({ error: 'Script not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let roleplayRun;

    if (!run_id) {
      // Create new roleplay run
      const { data: newRun, error: runError } = await supabaseClient
        .from('roleplay_runs')
        .insert({
          user_id: user.id,
          script_id: script.id,
          current_step: 0,
          state: {}
        })
        .select('*')
        .single();

      if (runError) {
        console.error('Run creation error:', runError);
        throw new Error('Failed to create roleplay run');
      }
      roleplayRun = newRun;
    } else {
      // Get existing run
      const { data: existingRun, error: runError } = await supabaseClient
        .from('roleplay_runs')
        .select('*')
        .eq('id', run_id)
        .eq('user_id', user.id)
        .single();

      if (runError || !existingRun) {
        console.error('Run fetch error:', runError);
        return new Response(JSON.stringify({ error: 'Roleplay run not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      roleplayRun = existingRun;
    }

    const steps = script.steps as any[];
    let currentStep = roleplayRun.current_step;
    let currentState = roleplayRun.state as any;

    // Handle user choice
    if (user_choice && currentStep < steps.length) {
      const step = steps.find((s: any) => s.id === currentStep + 1);
      if (step && step.options) {
        const selectedOption = step.options.find((opt: any) => opt.value === user_choice);
        if (selectedOption) {
          currentState.lastChoice = user_choice;
          currentStep = selectedOption.next || currentStep + 1;
        }
      }
    }

    // Get current step
    const step = steps.find((s: any) => s.id === currentStep + 1);
    if (!step) {
      // Roleplay completed
      return new Response(JSON.stringify({
        run_id: roleplayRun.id,
        done: true,
        message: lang === 'sv' ? 'Rollspelet är avslutat!' : 'Roleplay completed!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let prompt = step.prompt;
    let options = step.options || [];

    // If step requires AI improvisation (no fixed options)
    if (!options.length && step.ai_improve) {
      // Call OpenAI for dynamic response
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a supportive roleplay coach. Respond in ${lang === 'sv' ? 'Swedish' : 'English'}. Stay in character and be encouraging. Keep responses under 150 words.`
            },
            {
              role: 'user',
              content: `Context: ${script.description}. Current situation: ${prompt}. User chose: ${user_choice || 'no choice yet'}. Continue the roleplay scenario.`
            }
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        prompt = aiData.choices[0]?.message?.content || prompt;
      }
    }

    // Update roleplay run
    await supabaseClient
      .from('roleplay_runs')
      .update({
        current_step: currentStep,
        state: currentState,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleplayRun.id);

    return new Response(JSON.stringify({
      run_id: roleplayRun.id,
      step: currentStep + 1,
      total_steps: steps.length,
      prompt,
      options,
      done: false,
      script_title: script.title
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auri-roleplay:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});