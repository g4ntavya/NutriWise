import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, payload) => {
      // payload is a Session | null in supabase-js v2
      const newSession = (payload as Session | null) ?? null;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // When user signs in, redirect to the landing page 'Plan Smart' section
      if (event === 'SIGNED_IN') {
        try {
          // navigate to the protected app UI after sign in
          navigate('/app');
        } catch (e) {
          // no-op
        }
      }

      if (event === 'SIGNED_OUT') {
        try {
          navigate('/');
        } catch (e) {
          // no-op
        }
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default useAuth;
