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
    const created = {
      profiles: 0,
      moods: 0,
      journals: 0,
      exercises: 0
    };

    // 1. Create profile if not exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: 'Demo User',
          email: user.email,
          full_name: 'Demo User',
        });

      if (!profileError) {
        created.profiles = 1;
      }
    }

    // 2. Create 5 mood entries over last 7 days
    const moodData = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      moodData.push({
        user_id: userId,
        mood_value: Math.floor(Math.random() * 5) + 1, // 1-5
        notes: `Demo mood entry ${i + 1}`,
        created_at: date.toISOString()
      });
    }

    const { data: moodInsert, error: moodError } = await supabase
      .from('mood_entries')
      .insert(moodData);

    if (!moodError) {
      created.moods = 5;
    }

    // 3. Create 2 journal entries
    const journalData = [
      {
        user_id: userId,
        title: 'My First Demo Journal',
        content: 'This is a demo journal entry to show how journaling works in the app.',
        content_text: 'This is a demo journal entry to show how journaling works in the app.',
        tags: ['demo', 'first'],
        is_private: true
      },
      {
        user_id: userId,
        title: 'Reflecting on Today',
        content: 'Today was a good day for trying out this wellness app. The interface feels intuitive and helpful.',
        content_text: 'Today was a good day for trying out this wellness app. The interface feels intuitive and helpful.',
        tags: ['reflection', 'wellness'],
        is_private: true
      }
    ];

    const { data: journalInsert, error: journalError } = await supabase
      .from('journal_entries')
      .insert(journalData);

    if (!journalError) {
      created.journals = 2;
    }

    // 4. Create 3 exercises if exercises table is empty (global catalog)
    const { data: existingExercises, error: exerciseCheckError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);

    if (!exerciseCheckError && (!existingExercises || existingExercises.length === 0)) {
      const exerciseData = [
        {
          title: 'Deep Breathing Exercise',
          description: 'A simple breathing exercise to help you relax and center yourself.',
          duration_minutes: 5,
          category: 'breathing',
          difficulty_level: 'beginner'
        },
        {
          title: 'Mindfulness Meditation',
          description: 'A gentle introduction to mindfulness meditation practice.',
          duration_minutes: 10,
          category: 'meditation',
          difficulty_level: 'beginner'
        },
        {
          title: 'Progressive Muscle Relaxation',
          description: 'Systematically tense and release different muscle groups for deep relaxation.',
          duration_minutes: 15,
          category: 'relaxation',
          difficulty_level: 'intermediate'
        }
      ];

      const { data: exerciseInsert, error: exerciseError } = await supabase
        .from('exercises')
        .insert(exerciseData);

      if (!exerciseError) {
        created.exercises = 3;
      }
    }

    console.log('Demo data seeded successfully:', created);

    return new Response(
      JSON.stringify({ ok: true, created }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Demo seed error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed demo data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});