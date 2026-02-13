import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, UserProfile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  roles: AppRole[];
  loading: boolean;
  demoMode: boolean;
  demoRole: AppRole;
  setDemoMode: (v: boolean) => void;
  setDemoRole: (r: AppRole) => void;
  activeRole: AppRole | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<AppRole>('manufacturer');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchRoles(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (data) setProfile(data as UserProfile);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    if (data) setRoles(data.map((r: any) => r.role as AppRole));
  };

  const activeRole: AppRole | null = demoMode ? demoRole : (roles[0] ?? null);

  const signOut = async () => {
    await supabase.auth.signOut();
    setDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, roles, loading,
      demoMode, demoRole, setDemoMode, setDemoRole,
      activeRole, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
