import { supabase } from '@/integrations/supabase/client';

export interface StreamingChatOptions {
  sessionId?: string;
  text: string;
  lang: string;
  onToken?: (token: string) => void;
  onSession?: (sessionId: string) => void;
  onDone?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export class AuriService {
  private abortController: AbortController | null = null;

  async startOrSendMessage(options: StreamingChatOptions): Promise<void> {
    const { sessionId, text, lang, onToken, onSession, onDone, onError } = options;

    try {
      // Cancel any existing request
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/auri-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_text: text,
            lang,
          }),
          signal: this.abortController.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'session' && onSession) {
                onSession(parsed.session_id);
              } else if (parsed.type === 'token' && onToken) {
                onToken(parsed.content);
              } else if (parsed.type === 'done' && onDone) {
                onDone(parsed.session_id);
              } else if (parsed.type === 'error' && onError) {
                onError(parsed.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't call onError
        return;
      }
      console.error('Streaming error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const auriService = new AuriService();