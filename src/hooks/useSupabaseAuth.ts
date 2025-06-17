
import { useAuthContext } from '@/context/AuthContext';
import { supabaseAuthService } from '@/services/supabaseAuthService';

export interface Profile {
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

// Re-export everything from useAuth for backward compatibility
export const useSupabaseAuth = () => {
  const auth = useAuthContext();
  
  return {
    ...auth,
    // Add any additional methods that were specific to useSupabaseAuth
    login: auth.signIn,
    register: auth.signUp,
    resetPassword: async (email: string) => {
      return await supabaseAuthService.resetPassword(email);
    },
    updateProfile: async (updates: any) => {
      // Implementation for updating profile if needed
      console.log('updateProfile called with:', updates);
    },
    // Add missing properties for compatibility
    userRole: null,
    initializing: auth.loading,
  };
};
