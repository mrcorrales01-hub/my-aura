import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for content moderation result
interface ModerationResult {
  flagged: boolean;
  reasons: string[];
}

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

  // Helper function to check rate limits
  const checkRateLimit = async (email: string, attemptType: 'login' | 'signup' | 'password_reset') => {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: { email, attemptType }
      });

      if (error) {
        console.error('Rate limiter error:', error);
        return { allowed: true }; // Fail open for availability
      }

      return data;
    } catch (error) {
      console.error('Rate limiter connection error:', error);
      return { allowed: true }; // Fail open for availability
    }
  };

  // Authentication helpers with rate limiting and content moderation
  const signUp = async (email: string, password: string, metadata?: any) => {
    // Check rate limit first
    const rateLimitCheck = await checkRateLimit(email, 'signup');
    if (!rateLimitCheck.allowed) {
      const errorMessage = rateLimitCheck.reason === 'Rate limited' 
        ? 'Too many signup attempts. Please try again later.'
        : 'Account creation temporarily blocked due to too many attempts.';
      
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }

    // Moderate user-provided content
    if (metadata?.full_name) {
      try {
        const { data: moderationResult } = await supabase.rpc('moderate_content', {
          content_text: metadata.full_name
        });
        
        const result = moderationResult as unknown as ModerationResult;
        if (result?.flagged) {
          toast.error('Name contains inappropriate content. Please use a different name.');
          return { error: { message: 'Content moderation failed' } };
        }
      } catch (error) {
        console.error('Content moderation error:', error);
        // Continue with signup if moderation fails
      }
    }

    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: metadata },
    });

    if (error) {
      toast.error(error.message);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limit first
    const rateLimitCheck = await checkRateLimit(email, 'login');
    if (!rateLimitCheck.allowed) {
      const errorMessage = rateLimitCheck.reason === 'Rate limited'
        ? 'Too many login attempts. Please try again later.'
        : 'Account temporarily locked due to too many failed attempts.';
      
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
