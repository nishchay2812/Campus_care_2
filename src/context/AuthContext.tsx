import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ success: false, error: 'Not initialized' }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to verify trusted admin role from app_metadata
  const verifyAdminRole = (sess: Session | null): boolean => {
    return sess?.user?.app_metadata?.role === 'admin';
  };

  // Synchronize and validate session state
  const handleSession = useCallback(async (sess: Session | null) => {
    if (!sess) {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const hasAdminRole = verifyAdminRole(sess);

    if (hasAdminRole) {
      setSession(sess);
      setUser(sess.user);
      setIsAdmin(true);
      setIsLoading(false);
    } else {
      // User is authenticated but does NOT possess the trusted admin role
      // Immediately sign them out per Step 7.1 requirement 4
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out non-admin user:', err);
      }
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session retrieval from Supabase persistence storage
    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching Supabase session:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          await handleSession(data.session);
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // 2. Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (isMounted) {
        await handleSession(newSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase authentication is not configured. Please check your environment variables.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid email or password.',
        };
      }

      const activeSession = data.session;
      const role = activeSession?.user?.app_metadata?.role;

      if (role !== 'admin') {
        // Immediately sign them out
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        return {
          success: false,
          error: 'Unauthorized access: This account does not possess administrator privileges.',
        };
      }

      setSession(activeSession);
      setUser(activeSession.user);
      setIsAdmin(true);

      return { success: true };
    } catch (err: unknown) {
      console.error('Sign in exception:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'An unexpected authentication error occurred.';
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
