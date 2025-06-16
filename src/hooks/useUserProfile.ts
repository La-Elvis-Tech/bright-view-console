
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  unit_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  unit?: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
  };
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error) throw error;
      
      // Fetch unit separately
      let unitData = null;
      if (data.unit_id) {
        const { data: unit, error: unitError } = await supabase
          .from('units')
          .select('name, code, address, phone')
          .eq('id', data.unit_id)
          .single();
        
        if (!unitError && unit) {
          unitData = unit;
        }
      }
      
      // Map the database status to our interface status
      const mappedProfile: UserProfile = {
        ...data,
        status: data.status === 'pending' ? 'inactive' : data.status as 'active' | 'inactive' | 'suspended',
        unit: unitData || undefined
      };
      
      setProfile(mappedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil do usuário.',
        variant: 'destructive',
      });
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setUnits(data || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Map our interface status to database status if needed
      const dbUpdates = {
        ...updates,
        status: updates.status === 'suspended' ? 'inactive' : updates.status
      };

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userData.user.id);

      if (error) throw error;
      
      await fetchProfile(); // Refresh profile data
      
      toast({
        title: 'Perfil atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAvatar = async (avatarUrl: string | null) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userData.user.id);

      if (error) throw error;
      
      // Update local state immediately
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl || undefined } : null);
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchUnits()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    profile,
    units,
    loading,
    updateProfile,
    updateAvatar,
    refreshProfile: fetchProfile,
  };
};
