
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

interface AuthContextType {
  user: any;
  session: any;
  profile: any;
  role: any;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  refreshProfile: () => void;
  refreshRole: () => void;
  isAuthenticated: boolean;
  userRole: any;
  hasRole: (role: 'admin' | 'user' | 'supervisor') => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isPending: () => boolean;
  isActive: () => boolean;
  isSuspended: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
