
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface SupabaseAuthContextType {
  user: any;
  session: any;
  profile: any;
  userRole: any;
  loading: boolean;
  initializing: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  hasRole: (role: 'admin' | 'user' | 'supervisor') => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isAuthenticated: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useSupabaseAuth();

  const contextValue: SupabaseAuthContextType = {
    user: auth.user,
    session: auth.session,
    profile: auth.profile,
    userRole: auth.userRole,
    loading: auth.loading,
    initializing: auth.initializing,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updateProfile: auth.updateProfile,
    hasRole: auth.hasRole,
    isAdmin: auth.isAdmin,
    isSupervisor: auth.isSupervisor,
    isAuthenticated: auth.isAuthenticated,
  };

  return (
    <SupabaseAuthContext.Provider value={contextValue}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuthContext = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuthContext must be used within a SupabaseAuthProvider');
  }
  return context;
};
