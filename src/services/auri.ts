import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamAuriChatOptions {
  messages: ChatMessage[];
  lang: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

interface RoleplayOptions {
  scenarioId: string;
  step: number;
  transcript: ChatMessage[];
  lang: string;
}

// Get function URL based on Supabase URL
const getFunctionUrl = (name: string): string => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  return `${base}/functions/v1/${name}`;
};

// Get session access token from Supabase auth
const getSessionAccessToken = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
};

// Convert response to event stream
const toEventStream = async function* (response: Response) {
  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            yield JSON.parse(data);
          } catch (e) {
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const streamAuriChat = async (payload: StreamAuriChatOptions) => {
  const token = await getSessionAccessToken();
  
  const response = await fetch(getFunctionUrl('auri-chat'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return {
    stream: toEventStream(response),
    isDemoMode: response.headers.get('x-demo-mode') === '1'
  };
};

export const streamRoleplay = async (payload: RoleplayOptions) => {
  const token = await getSessionAccessToken();

  const response = await fetch(getFunctionUrl('auri-roleplay'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return {
    stream: toEventStream(response),
    isDemoMode: response.headers.get('x-demo-mode') === '1'
  };
};

// Legacy service compatibility - can be removed once components are updated
export class AuriService {
  private abortController: AbortController | null = null;

  async startOrSendMessage(options: {
    sessionId?: string;
    text: string;
    lang: string;
    onToken?: (token: string) => void;
    onSession?: (sessionId: string) => void;
    onDone?: (sessionId: string) => void;
    onError?: (error: string) => void;
  }): Promise<void> {
    try {
      // Cancel any existing request
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      const messages: ChatMessage[] = [
        { role: 'user', content: options.text }
      ];

      const { stream, isDemoMode } = await streamAuriChat({
        messages,
        lang: options.lang
      });

      if (isDemoMode && options.onError) {
        options.onError('Demo mode: OpenAI API key missing');
        return;
      }

      for await (const chunk of stream) {
        if (this.abortController.signal.aborted) return;

        if (chunk.type === 'session' && options.onSession) {
          options.onSession(chunk.session_id);
        } else if (chunk.type === 'token' && options.onToken) {
          options.onToken(chunk.content);
        } else if (chunk.type === 'done' && options.onDone) {
          options.onDone(chunk.session_id);
        } else if (chunk.type === 'error' && options.onError) {
          options.onError(chunk.error);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      if (options.onError) {
        options.onError(error instanceof Error ? error.message : 'Unknown error');
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