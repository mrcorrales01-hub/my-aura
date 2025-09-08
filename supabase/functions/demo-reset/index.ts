import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const deleted = {
      moods: 0,
      journals: 0,
      messages: 0,
      conversations: 0,
      appointments: 0,
      ai_predictions: 0,
      crisis_interactions: 0
    };

    // Delete mood entries
    const { data: deletedMoods, error: moodError } = await supabase
      .from('mood_entries')
      .delete()
      .eq('user_id', userId);

    if (!moodError) {
      deleted.moods = Array.isArray(deletedMoods) ? deletedMoods.length : 0;
    }

    // Delete journal entries
    const { data: deletedJournals, error: journalError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', userId);

    if (!journalError) {
      deleted.journals = Array.isArray(deletedJournals) ? deletedJournals.length : 0;
    }

    // Delete messages
    const { data: deletedMessages, error: messageError } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', userId);

    if (!messageError) {
      deleted.messages = Array.isArray(deletedMessages) ? deletedMessages.length : 0;
    }

    // Delete conversations
    const { data: deletedConversations, error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (!conversationError) {
      deleted.conversations = Array.isArray(deletedConversations) ? deletedConversations.length : 0;
    }

    // Delete appointments (as client)
    const { data: deletedAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .delete()
      .eq('client_id', userId);

    if (!appointmentError) {
      deleted.appointments = Array.isArray(deletedAppointments) ? deletedAppointments.length : 0;
    }

    // Delete AI predictions
    const { data: deletedPredictions, error: predictionError } = await supabase
      .from('ai_predictions')
      .delete()
      .eq('user_id', userId);

    if (!predictionError) {
      deleted.ai_predictions = Array.isArray(deletedPredictions) ? deletedPredictions.length : 0;
    }

    // Delete crisis interactions
    const { data: deletedCrisis, error: crisisError } = await supabase
      .from('crisis_interactions')
      .delete()
      .eq('user_id', userId);

    if (!crisisError) {
      deleted.crisis_interactions = Array.isArray(deletedCrisis) ? deletedCrisis.length : 0;
    }

    console.log('User data reset successfully:', deleted);

    return new Response(
      JSON.stringify({ ok: true, deleted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Demo reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reset user data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});