import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamAuriChatOptions {
  message: string;
  sessionId?: string;
  language?: string;
}

interface RoleplayOptions {
  scenarioId: string;
  step: string;
  transcript: string;
  language?: string;
}

// Get function URL
const getFunctionUrl = (name: string): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/${name}`;
};

// Get session access token
const getSessionAccessToken = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
};

// Server-Sent Events stream processor
async function* toEventStream(response: Response) {
  if (!response.body) return;
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              yield JSON.parse(data);
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Auri chat streaming
export async function streamAuriChat(payload: StreamAuriChatOptions) {
  const accessToken = await getSessionAccessToken();
  
  const response = await fetch(getFunctionUrl('auri-chat'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to start chat: ${response.status}`);
  }

  const isDemoMode = response.headers.get('x-demo-mode') === '1';
  
  return {
    stream: toEventStream(response),
    isDemoMode
  };
}

// Auri roleplay streaming
export async function streamRoleplay(payload: RoleplayOptions) {
  const accessToken = await getSessionAccessToken();
  
  const response = await fetch(getFunctionUrl('auri-roleplay'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to start roleplay: ${response.status}`);
  }

  const isDemoMode = response.headers.get('x-demo-mode') === '1';
  
  return {
    stream: toEventStream(response),
    isDemoMode
  };
}

// Legacy service class for backward compatibility
export class AuriService {
  private controller?: AbortController;

  async startOrSendMessage(
    message: string, 
    onData: (data: any) => void,
    sessionId?: string,
    language?: string
  ) {
    this.abort(); // Cancel any existing request
    this.controller = new AbortController();

    try {
      const { stream, isDemoMode } = await streamAuriChat({
        message,
        sessionId,
        language
      });

      for await (const data of stream) {
        if (this.controller.signal.aborted) break;
        onData({ ...data, isDemoMode });
      }
    } catch (error) {
      if (!this.controller.signal.aborted) {
        throw error;
      }
    }
  }

  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = undefined;
    }
  }
}

export const auriService = new AuriService();