import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkUserBlacklist } from '@/hooks/useBlacklistCheck';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<{ data: { user: User | null } | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isBlacklisted?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maximum time to wait for auth initialization (prevents infinite loading)
const AUTH_TIMEOUT_MS = 10000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Memoized blacklist check to prevent unnecessary re-renders
  const performBlacklistCheck = useCallback(async (userId: string) => {
    try {
      const result = await checkUserBlacklist(userId);
      setIsBlacklisted(result.isBlacklisted);
      setBlacklistReason(result.reason);
      return result;
    } catch (error) {
      console.error('Blacklist check failed:', error);
      setIsBlacklisted(false);
      setBlacklistReason(null);
      return { isBlacklisted: false, reason: null };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set up timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Auth initialization timed out, proceeding without session');
            setLoading(false);
            setInitialized(true);
          }
        }, AUTH_TIMEOUT_MS);

        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          setSession(session);
          setUser(session?.user ?? null);
          
          // Only check blacklist on sign-in events with a valid user
          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Use setTimeout to avoid blocking the auth state update
            setTimeout(() => {
              if (mounted) {
                performBlacklistCheck(session.user.id);
              }
            }, 0);
          } else if (!session) {
            setIsBlacklisted(false);
            setBlacklistReason(null);
          }
          
          setLoading(false);
          setInitialized(true);
        });

        // Then check for existing session
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Failed to get session:', error);
        }

        if (mounted) {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
          
          if (existingSession?.user) {
            // Don't await - let it run in background
            performBlacklistCheck(existingSession.user.id);
          }
          
          setLoading(false);
          setInitialized(true);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [performBlacklistCheck]);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName,
          },
        },
      });
      return { data: data ? { user: data.user } : null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Check blacklist status after successful login
        const result = await performBlacklistCheck(data.user.id);
        
        if (result.isBlacklisted) {
          // Sign out the blacklisted user
          await supabase.auth.signOut();
          return { 
            error: new Error('계정이 제한되었습니다. 고객센터에 문의해주세요.'), 
            isBlacklisted: true 
          };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsBlacklisted(false);
      setBlacklistReason(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isBlacklisted, 
      blacklistReason, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
