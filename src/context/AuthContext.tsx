
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuthService } from '@/services/supabaseAuthService';
import { authLogger } from '@/utils/authLogger';
import { cleanupAuthState } from '@/utils/authHelpers';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  unit_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  hasRole: (role: 'admin' | 'user' | 'supervisor') => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state with proper React hooks
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      authLogger.info('Fetching user profile', { userId });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        authLogger.error('Error fetching profile', { userId, error: profileError.message });
        throw profileError;
      }

      if (profileData) {
        authLogger.info('Profile fetched successfully', { 
          userId, 
          status: profileData.status,
          unitId: profileData.unit_id 
        });
        setProfile(profileData);
      }
    } catch (error: any) {
      authLogger.error('Failed to fetch profile', { userId, error: error.message });
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    authLogger.info('AuthContext initializing');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        authLogger.info('Auth state changed', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data after successful authentication
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        authLogger.error('Error getting initial session', { error: error.message });
      } else {
        authLogger.info('Initial session check', { hasSession: !!session });
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      authLogger.info('Auth state listener cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      authLogger.info('Sign in attempt', { email });
      
      const result = await supabaseAuthService.signIn(email, password);
      
      authLogger.info('Sign in successful', { email });
      return { data: result };
    } catch (error: any) {
      authLogger.error('Sign in failed', { email, error: error.message });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      authLogger.info('Sign up attempt', { email, fullName });
      
      const result = await supabaseAuthService.signUp(email, password, fullName);
      
      authLogger.info('Sign up successful', { email });
      return { data: result };
    } catch (error: any) {
      authLogger.error('Sign up failed', { email, error: error.message });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      authLogger.info('Sign out initiated');
      
      await supabaseAuthService.signOut();
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clean up any remaining auth data
      cleanupAuthState();
      
      authLogger.info('Sign out completed');
    } catch (error: any) {
      authLogger.error('Sign out failed', { error: error.message });
      throw error;
    }
  };

  const isAdmin = () => {
    return profile?.status === 'active' && user?.id ? true : false;
  };

  const isSupervisor = () => {
    return profile?.status === 'active' && user?.id ? true : false;
  };

  const hasRole = (role: 'admin' | 'user' | 'supervisor') => {
    return profile?.status === 'active' && user?.id ? true : false;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!session && !!user,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSupervisor,
    hasRole,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
