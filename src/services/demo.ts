import { supabase } from '@/integrations/supabase/client';

const getBaseUrl = () => import.meta.env.VITE_SUPABASE_URL;
const getFunctionUrl = (name: string) => `${getBaseUrl()}/functions/v1/${name}`;

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

export interface DemoSeedResult {
  ok: boolean;
  created: {
    profiles: number;
    moods: number;
    journals: number;
    exercises: number;
  };
}

export interface DemoResetResult {
  ok: boolean;
  deleted: {
    moods: number;
    journals: number;
    messages: number;
    conversations: number;
    appointments: number;
    ai_predictions: number;
    crisis_interactions: number;
  };
}

export async function seedDemoData(): Promise<DemoSeedResult> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(getFunctionUrl('demo-seed'), {
    method: 'POST',
    headers
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to seed demo data: ${error}`);
  }
  
  return response.json();
}

export async function resetUserData(): Promise<DemoResetResult> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(getFunctionUrl('demo-reset'), {
    method: 'POST',
    headers
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reset user data: ${error}`);
  }
  
  return response.json();
}