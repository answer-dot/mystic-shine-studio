import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkUserBlacklist } from '@/hooks/useBlacklistCheck';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isBlacklisted?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check blacklist status when user logs in
      if (session?.user) {
        const result = await checkUserBlacklist(session.user.id);
        setIsBlacklisted(result.isBlacklisted);
        setBlacklistReason(result.reason);
      } else {
        setIsBlacklisted(false);
        setBlacklistReason(null);
      }
      
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const result = await checkUserBlacklist(session.user.id);
        setIsBlacklisted(result.isBlacklisted);
        setBlacklistReason(result.reason);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // Check blacklist status after successful login
      const result = await checkUserBlacklist(data.user.id);
      setIsBlacklisted(result.isBlacklisted);
      setBlacklistReason(result.reason);
      
      if (result.isBlacklisted) {
        // Sign out the blacklisted user
        await supabase.auth.signOut();
        return { 
          error: new Error('계정이 제한되었습니다. 고객센터에 문의해주세요.'), 
          isBlacklisted: true 
        };
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsBlacklisted(false);
    setBlacklistReason(null);
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
