
import { useAuth } from './useAuth';

// Re-export everything from useAuth for backward compatibility
export const useSupabaseAuth = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    // Add any additional methods that were specific to useSupabaseAuth
    login: auth.signIn,
    register: auth.signUp,
    updateProfile: async (updates: any) => {
      // Implementation for updating profile if needed
      console.log('updateProfile called with:', updates);
    },
  };
};

// Re-export types
export type { Profile, UserRole } from './useAuth';
