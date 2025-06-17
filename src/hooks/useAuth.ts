import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authLogger } from '@/utils/authLogger';

export interface User {
  id: string;
  email: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'pending';
  unit_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  role: 'admin' | 'user' | 'supervisor' | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    role: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          authLogger.error('Error getting session', { error: error.message });
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (session?.user) {
          authLogger.info('User authenticated, fetching profile and role', {
            userId: session.user.id,
            email: session.user.email
          });

          const profile = await fetchUserProfile(session.user.id);
          const role = await fetchUserRole(session.user.id);

          setAuthState({
            user: session.user as User,
            profile,
            role,
            loading: false
          });
        } else {
          authLogger.info('No active session found');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error: any) {
        authLogger.error('Error during initial auth check', { error: error.message });
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        authLogger.info('Auth state change', {
          event,
          userEmail: session?.user?.email,
          hasSession: !!session
        });

        if (session?.user) {
          authLogger.info('User authenticated, fetching profile and role', {
            userId: session.user.id,
            email: session.user.email
          });

          const profile = await fetchUserProfile(session.user.id);
          const role = await fetchUserRole(session.user.id);

          setAuthState({
            user: session.user as User,
            profile,
            role,
            loading: false
          });
        } else {
          authLogger.info('User signed out');
          setAuthState({
            user: null,
            profile: null,
            role: null,
            loading: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      authLogger.info('Fetching user profile', { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        authLogger.error('Error fetching profile', { userId, error: error.message });
        return null;
      }

      authLogger.info('Profile fetched successfully', {
        userId,
        email: data.email,
        status: data.status
      });

      return data as Profile;
    } catch (error: any) {
      authLogger.error('Exception fetching profile', { userId, error: error.message });
      return null;
    }
  };

  const fetchUserRole = async (userId: string): Promise<'admin' | 'user' | 'supervisor' | null> => {
    try {
      authLogger.info('Fetching user role', { userId });
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })
        .limit(1);

      if (error) {
        authLogger.error('Error fetching role', { userId, error: error.message });
        return null;
      }

      const role = data?.[0]?.role || null;
      authLogger.info('User role fetched', { userId, role });

      return role;
    } catch (error: any) {
      authLogger.error('Exception fetching role', { userId, error: error.message });
      return null;
    }
  };

  const signOut = async () => {
    try {
      authLogger.info('User signing out');
      await supabase.auth.signOut();
    } catch (error: any) {
      authLogger.error('Error signing out', { error: error.message });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user?.id) return null;

    try {
      authLogger.info('Updating user profile', { userId: authState.user.id, updates });
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        authLogger.error('Error updating profile', { 
          userId: authState.user.id, 
          error: error.message 
        });
        return null;
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        profile: data as Profile
      }));

      authLogger.info('Profile updated successfully', { userId: authState.user.id });
      return data as Profile;
    } catch (error: any) {
      authLogger.error('Exception updating profile', { 
        userId: authState.user.id, 
        error: error.message 
      });
      return null;
    }
  };

  // Helper functions
  const isAuthenticated = (): boolean => {
    return !!authState.user && authState.profile?.status === 'active';
  };

  const isAdmin = (): boolean => {
    return authState.role === 'admin';
  };

  const isSupervisor = (): boolean => {
    return authState.role === 'supervisor';
  };

  const isPending = (): boolean => {
    return authState.profile?.status === 'pending';
  };

  const isInactive = (): boolean => {
    return authState.profile?.status === 'inactive';
  };

  return {
    // State
    user: authState.user,
    profile: authState.profile,
    role: authState.role,
    loading: authState.loading,
    
    // Actions
    signOut,
    updateProfile,
    
    // Helpers
    isAuthenticated,
    isAdmin,
    isSupervisor,
    isPending,
    isInactive,
    
    // Internal functions (for testing/debugging)
    fetchUserProfile,
    fetchUserRole
  };
};
