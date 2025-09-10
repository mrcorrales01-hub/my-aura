import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateContent, sanitizeInput, logSecurityEvent, checkRateLimit, checkPasswordLeak } from '@/utils/security';

/**
 * Defines the shape of the authentication context exposed by the AuthProvider.
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>; 
  signIn: (email: string, password: string) => Promise<{ error: any }>; 
  signInWithGoogle: () => Promise<{ error: any }>; 
  signInWithApple: () => Promise<{ error: any }>; 
  signOut: () => Promise<void>;
}

/**
 * A default stub used when AuthProvider is missing. Returning this instead of
 * throwing allows the rest of the application to operate (albeit without an
 * authenticated user) rather than crashing.
 */
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithApple: async () => ({ error: null }),
  signOut: async () => {},
};

// Initialize the context with undefined. We'll perform a runtime check in useAuth.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Supabase auth state changes and load the initial session.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // Fetch existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    return () => subscription.unsubscribe();
  }, []);

  // Enhanced authentication event logging
  const logAuthEvent = async (eventType: string, success: boolean, details: any = {}) => {
    await logSecurityEvent(
      eventType,
      success ? 'low' : 'medium',
      {
        success,
        timestamp: new Date().toISOString(),
        ...details
      }
    );
  };

  // Enhanced authentication helpers with comprehensive security
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      // Enhanced rate limiting
      const rateLimited = checkRateLimit('signup');
      if (!rateLimited) {
        await logAuthEvent('signup_rate_limited', false, { email });
        toast.error('Too many signup attempts. Please try again later.');
        return { error: { message: 'Rate limited' } };
      }

      // Password leak detection
      const { isLeaked } = await checkPasswordLeak(password);
      if (isLeaked) {
        await logAuthEvent('signup_leaked_password', false, { email });
        toast.error('This password has been found in data breaches. Please choose a different password.');
        return { error: { message: 'Compromised password' } };
      }

      // Enhanced content validation for metadata
      if (metadata?.full_name) {
        const sanitizedName = sanitizeInput(metadata.full_name);
        const validation = await validateContent(sanitizedName, 'profile');
        
        if (!validation.isValid || validation.crisisDetected) {
          await logAuthEvent('signup_invalid_content', false, { email, issues: validation.issues });
          toast.error('Name contains inappropriate content. Please use a different name.');
          return { error: { message: 'Content validation failed' } };
        }
        metadata.full_name = sanitizedName;
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: metadata },
      });

      if (error) {
        await logAuthEvent('signup_failed', false, { email, error: error.message });
        toast.error(error.message);
      } else {
        await logAuthEvent('signup_success', true, { email });
      }

      return { error };
    } catch (error) {
      await logAuthEvent('signup_error', false, { email, error: error.message });
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Enhanced security checks with new auth tracking
      const { data: authCheckResult } = await supabase.rpc('log_auth_attempt', {
        p_email: email,
        p_attempt_type: 'login',
        p_success: false,
        p_user_agent: navigator.userAgent
      });

      if (!authCheckResult) {
        await logAuthEvent('signin_blocked_rate_limit', false, { email });
        toast.error('Too many login attempts. Please try again later.');
        return { error: { message: 'Too many login attempts. Please try again later.' } };
      }

      // Enhanced rate limiting
      const rateLimited = checkRateLimit('login');
      if (!rateLimited) {
        await logAuthEvent('signin_rate_limited', false, { email });
        toast.error('Too many login attempts. Please try again later.');
        return { error: { message: 'Rate limited' } };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        await logAuthEvent('signin_failed', false, { email, error: error.message });
        toast.error(error.message);
      } else {
        // Log successful auth attempt
        await supabase.rpc('log_auth_attempt', {
          p_email: email,
          p_attempt_type: 'login',
          p_success: true,
          p_user_agent: navigator.userAgent
        });
        await logAuthEvent('signin_success', true, { email });
      }

      return { error };
    } catch (error) {
      await logAuthEvent('signin_error', false, { email, error: error.message });
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      
      if (error) {
        await logAuthEvent('oauth_signin_failed', false, { provider: 'google', error: error.message });
      } else {
        await logAuthEvent('oauth_signin_success', true, { provider: 'google' });
      }
      
      return { error };
    } catch (error) {
      await logAuthEvent('oauth_signin_error', false, { provider: 'google', error: error.message });
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/` },
      });
      
      if (error) {
        await logAuthEvent('oauth_signin_failed', false, { provider: 'apple', error: error.message });
      } else {
        await logAuthEvent('oauth_signin_success', true, { provider: 'apple' });
      }
      
      return { error };
    } catch (error) {
      await logAuthEvent('oauth_signin_error', false, { provider: 'apple', error: error.message });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await logAuthEvent('signout_success', true, {});
    } catch (error) {
      await logAuthEvent('signout_error', false, { error: error.message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume the authentication context. When called outside of an AuthProvider,
 * this hook returns a default implementation instead of throwing, ensuring that
 * components do not crash due to a missing provider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
};

export const useAuthContext = useAuth;
