import { supabase } from '@/integrations/supabase/client';

export interface RoleplayOption {
  text: string;
  value: string;
  next?: number;
}

export interface RoleplayResponse {
  run_id: string;
  step: number;
  total_steps: number;
  prompt: string;
  options: RoleplayOption[];
  done: boolean;
  script_title: string;
}

export interface RoleplayScript {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
}

export class RoleplayService {
  async getScripts(lang: string = 'sv'): Promise<RoleplayScript[]> {
    const { data, error } = await supabase
      .from('roleplay_scripts')
      .select('id, slug, title, description, language')
      .eq('language', lang)
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching scripts:', error);
      return [];
    }

    return data || [];
  }

  async startRoleplay(scriptSlug: string, lang: string = 'sv'): Promise<RoleplayResponse> {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-roleplay`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_slug: scriptSlug,
          lang,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start roleplay');
    }

    return await response.json();
  }

  async continueRoleplay(
    scriptSlug: string,
    runId: string,
    userChoice: string,
    lang: string = 'sv'
  ): Promise<RoleplayResponse> {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-roleplay`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_slug: scriptSlug,
          run_id: runId,
          user_choice: userChoice,
          lang,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to continue roleplay');
    }

    return await response.json();
  }
}

export const roleplayService = new RoleplayService();