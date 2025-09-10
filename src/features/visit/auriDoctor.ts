import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://rggohnwmajmrvxgfmimk.supabase.co";

export async function genDoctorQuestions({
  lang,
  logs,
  journals,
  phq9,
  gad7
}: {
  lang: string;
  logs: Array<{ intensity: number; tags: string[]; note?: string; createdAt: string }>;
  journals: string[];
  phq9?: number;
  gad7?: number;
}): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Prepare context from symptoms and journals
    const symptomsSummary = logs
      .slice(0, 10)
      .map(log => `${log.tags.join(', ')} (intensity: ${log.intensity}): ${log.note || ''}`)
      .join('; ') || 'None';
    
    const journalThemes = journals.slice(0, 5).join('; ') || 'None';
    
    const scores = [];
    if (phq9 !== undefined) scores.push(`PHQ-9: ${phq9}/27`);
    if (gad7 !== undefined) scores.push(`GAD-7: ${gad7}/21`);
    const scoresText = scores.length > 0 ? scores.join(', ') : 'Not assessed';
    
    const systemPrompt = `You are Auri, helping a patient prepare for a doctor visit. Reply in ${lang}. 

Produce 6-8 distinct, concise questions (≤100 chars each) based on:
- Last 14 days symptoms: ${symptomsSummary}
- Journal themes: ${journalThemes}
- Assessment scores: ${scoresText}

Avoid duplication. Return as a numbered list only.`;
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auri-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : '',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemPrompt }],
        lang,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    let result = '';
    if (response.body && response.headers.get('content-type')?.includes('text/plain')) {
      // Handle streaming response
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }
    } else {
      // Handle JSON response
      const data = await response.json();
      result = data.response || data.message || '';
    }
    
    // Parse numbered list to array
    const questions = result
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 10 && q.length <= 100)
      .slice(0, 8);
    
    return questions.length > 0 ? questions : [
      'How are my current symptoms affecting my daily life?',
      'What treatment options would you recommend?',
      'Are there any tests we should consider?',
      'How can I better manage my condition at home?',
      'When should I schedule a follow-up appointment?',
      'Are there any warning signs I should watch for?'
    ];
    
  } catch (error) {
    console.error('Error generating doctor questions:', error);
    // Return fallback questions
    return [
      'How are my current symptoms affecting my daily life?',
      'What treatment options would you recommend?',
      'Are there any tests we should consider?',
      'How can I better manage my condition at home?',
      'When should I schedule a follow-up appointment?',
      'Are there any warning signs I should watch for?'
    ];
  }
}

export async function genSBAR(
  lang: string,
  concerns: string,
  logsSummary: string,
  phq9?: number,
  gad7?: number
): Promise<{ S: string; B: string; A: string; R: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const scores = [];
    if (phq9 !== undefined) scores.push(`PHQ-9: ${phq9}`);
    if (gad7 !== undefined) scores.push(`GAD-7: ${gad7}`);
    const scoresText = scores.length > 0 ? scores.join(', ') : '';
    
    const systemPrompt = `You are Auri, helping format medical information for a doctor visit in ${lang}.

Create SBAR format (1-2 sentences each):
S (Situation): Patient's main concerns: ${concerns}
B (Background): Digital wellness tracking with symptoms: ${logsSummary}
A (Assessment): Current scores: ${scoresText}
R (Recommendation): What patient wants to discuss

Return as JSON: {"S":"...", "B":"...", "A":"...", "R":"..."}`;
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auri-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : '',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemPrompt }],
        lang,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    let result = '';
    if (response.body && response.headers.get('content-type')?.includes('text/plain')) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }
    } else {
      const data = await response.json();
      result = data.response || data.message || '';
    }
    
    // Try to parse JSON
    try {
      const parsed = JSON.parse(result);
      if (parsed.S && parsed.B && parsed.A && parsed.R) {
        return parsed;
      }
    } catch {
      // Fallback parsing
    }
    
    // Return fallback SBAR
    return {
      S: concerns || 'Patient seeking medical consultation for ongoing health concerns.',
      B: 'Patient using digital wellness tracking with symptom monitoring and AI coaching support.',
      A: scoresText || 'Self-assessment scores to be discussed.',
      R: 'Patient requests evaluation and treatment recommendations based on tracked symptoms.'
    };
    
  } catch (error) {
    console.error('Error generating SBAR:', error);
    return {
      S: concerns || 'Patient seeking medical consultation for ongoing health concerns.',
      B: 'Patient using digital wellness tracking with symptom monitoring and AI coaching support.',
      A: phq9 !== undefined || gad7 !== undefined ? `Assessment scores: ${phq9 ? 'PHQ-9: ' + phq9 : ''} ${gad7 ? 'GAD-7: ' + gad7 : ''}`.trim() : 'Self-assessment pending.',
      R: 'Patient requests evaluation and treatment recommendations based on tracked symptoms.'
    };
  }
}