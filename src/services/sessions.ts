import { supabase } from '@/integrations/supabase/client';

export interface ChatSession {
  id: string;
  lang: string;
  created_at: string;
  messages: { count: number }[];
}

export class SessionsService {
  async listSessions(): Promise<ChatSession[]> {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-sessions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sessions');
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async createSession(lang: string = 'sv'): Promise<ChatSession> {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-sessions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lang }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create session');
    }

    const data = await response.json();
    return data.session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-sessions?session_id=${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete session');
    }
  }

  async exportSessionAsText(sessionId: string): Promise<string> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) {
      throw new Error('Failed to fetch messages');
    }

    let exportText = `Auri Chat Session Export\nExported on: ${new Date().toLocaleDateString()}\n\n`;
    exportText += '=' .repeat(50) + '\n\n';

    messages?.forEach((message) => {
      const timestamp = new Date(message.created_at).toLocaleString();
      const speaker = message.role === 'user' ? 'You' : 'Auri';
      exportText += `[${timestamp}] ${speaker}:\n${message.content}\n\n`;
    });

    return exportText;
  }
}

export const sessionsService = new SessionsService();