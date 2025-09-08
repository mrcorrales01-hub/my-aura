import { supabase } from '@/integrations/supabase/client';

export interface HealthCheck {
  name: string;
  status: 'OK' | 'WARN' | 'FAIL';
  message: string;
  details?: any;
}

export interface HealthReport {
  i18n: HealthCheck;
  env: HealthCheck;
  supabase: HealthCheck;
  auriChat: HealthCheck;
  auriRoleplay: HealthCheck;
}

// Check if all 6 required i18n files exist
export async function checkI18nBundles(): Promise<HealthCheck> {
  const requiredLangs = ['sv', 'en', 'es', 'no', 'da', 'fi'];
  const requiredBundles = ['common', 'home'];
  
  try {
    const checks = [];
    
    for (const lang of requiredLangs) {
      for (const bundle of requiredBundles) {
        const url = `/locales/${lang}/${bundle}.json`;
        const response = await fetch(url);
        checks.push({
          url,
          status: response.status,
          ok: response.ok
        });
      }
    }
    
    const failedChecks = checks.filter(c => !c.ok);
    
    if (failedChecks.length === 0) {
      return {
        name: 'i18n',
        status: 'OK',
        message: `All ${requiredLangs.length} languages loaded successfully`
      };
    } else {
      return {
        name: 'i18n',
        status: 'FAIL',
        message: `${failedChecks.length} translation files missing`,
        details: failedChecks.map(c => c.url)
      };
    }
  } catch (error) {
    return {
      name: 'i18n',
      status: 'FAIL',
      message: `Error loading translations: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check environment variables
export function checkEnvironmentVars(): HealthCheck {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPPORTED_LANGS: import.meta.env.VITE_SUPPORTED_LANGS
  };
  
  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    return {
      name: 'env',
      status: 'FAIL',
      message: `Missing environment variables: ${missing.join(', ')}`
    };
  }
  
  // Check if supported languages are exactly the 6 we want
  const supportedLangs = (requiredVars.VITE_SUPPORTED_LANGS || '').split(',').map(l => l.trim());
  const expectedLangs = ['sv', 'en', 'es', 'no', 'da', 'fi'];
  const langsMatch = supportedLangs.length === expectedLangs.length && 
    expectedLangs.every(lang => supportedLangs.includes(lang));
  
  if (!langsMatch) {
    return {
      name: 'env',
      status: 'WARN',
      message: `Supported languages mismatch. Expected: ${expectedLangs.join(',')} Got: ${supportedLangs.join(',')}`
    };
  }
  
  return {
    name: 'env',
    status: 'OK',
    message: 'All environment variables present and valid'
  };
}

// Check Supabase connection with RLS-safe read
export async function checkSupabaseConnection(): Promise<HealthCheck> {
  try {
    // Try to read from achievements table (has public read access)
    const { data, error } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        name: 'supabase',
        status: 'FAIL',
        message: `Supabase query failed: ${error.message}`
      };
    }
    
    return {
      name: 'supabase',
      status: 'OK',
      message: 'Supabase connection and RLS working'
    };
  } catch (error) {
    return {
      name: 'supabase',
      status: 'FAIL',
      message: `Supabase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check auri-chat edge function
export async function checkAuriChatFunction(): Promise<HealthCheck> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return {
        name: 'auriChat',
        status: 'FAIL',
        message: 'Not authenticated - cannot test edge function'
      };
    }
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${baseUrl}/functions/v1/auri-chat?mode=health`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      return {
        name: 'auriChat',
        status: 'FAIL',
        message: `Edge function failed: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    const demoMode = response.headers.get('x-demo-mode');
    
    if (!data.ok) {
      return {
        name: 'auriChat',
        status: 'FAIL',
        message: 'Edge function returned error'
      };
    }
    
    if (!data.hasOpenAIKey || demoMode === '1') {
      return {
        name: 'auriChat',
        status: 'WARN',
        message: 'Edge function OK but running in demo mode (no OpenAI key)'
      };
    }
    
    return {
      name: 'auriChat',
      status: 'OK',
      message: 'Edge function working with OpenAI key configured'
    };
  } catch (error) {
    return {
      name: 'auriChat',
      status: 'FAIL',
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check auri-roleplay edge function
export async function checkAuriRoleplayFunction(): Promise<HealthCheck> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return {
        name: 'auriRoleplay',
        status: 'FAIL',
        message: 'Not authenticated - cannot test edge function'
      };
    }
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${baseUrl}/functions/v1/auri-roleplay?mode=health`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      return {
        name: 'auriRoleplay',
        status: 'FAIL',
        message: `Edge function failed: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    const demoMode = response.headers.get('x-demo-mode');
    
    if (!data.ok) {
      return {
        name: 'auriRoleplay',
        status: 'FAIL',
        message: 'Edge function returned error'
      };
    }
    
    if (!data.hasOpenAIKey || demoMode === '1') {
      return {
        name: 'auriRoleplay',
        status: 'WARN',
        message: 'Edge function OK but running in demo mode (no OpenAI key)'
      };
    }
    
    return {
      name: 'auriRoleplay',
      status: 'OK',
      message: 'Edge function working with OpenAI key configured'
    };
  } catch (error) {
    return {
      name: 'auriRoleplay',
      status: 'FAIL',
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Run all health checks
export async function runHealthChecks(): Promise<HealthReport> {
  const [i18n, supabaseCheck, auriChat, auriRoleplay] = await Promise.all([
    checkI18nBundles(),
    checkSupabaseConnection(),
    checkAuriChatFunction(),
    checkAuriRoleplayFunction()
  ]);
  
  const env = checkEnvironmentVars();
  
  return {
    i18n,
    env,
    supabase: supabaseCheck,
    auriChat,
    auriRoleplay
  };
}