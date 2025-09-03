import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateContent, logSecurityEvent } from '@/utils/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithApple: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log authentication events for security monitoring
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            logSecurityEvent('user_signed_in', 'low', {
              user_id: session.user.id,
              timestamp: new Date().toISOString()
            }, 20);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            logSecurityEvent('user_signed_out', 'low', {
              timestamp: new Date().toISOString()
            }, 10);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      // Enhanced content moderation for sign-up data
      if (metadata.full_name) {
        const validation = await validateContent(metadata.full_name, 'profile');
        if (!validation.isValid) {
          return { error: { message: 'Profile information contains inappropriate content' } };
        }
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        await logSecurityEvent('signup_failed', 'medium', {
          email,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }, 40);
      }

      return { error };
    } catch (error: any) {
      await logSecurityEvent('signup_error', 'high', {
        email,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }, 60);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await logSecurityEvent('signin_failed', 'medium', {
          email,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }, 50);
      }

      return { error };
    } catch (error: any) {
      await logSecurityEvent('signin_error', 'high', {
        email,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }, 70);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error: any) {
      await logSecurityEvent('oauth_signin_error', 'medium', {
        provider: 'google',
        error_message: error.message,
        timestamp: new Date().toISOString()
      }, 40);
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error: any) {
      await logSecurityEvent('oauth_signin_error', 'medium', {
        provider: 'apple',
        error_message: error.message,
        timestamp: new Date().toISOString()
      }, 40);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      await logSecurityEvent('signout_error', 'low', {
        error_message: error.message,
        timestamp: new Date().toISOString()
      }, 30);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};