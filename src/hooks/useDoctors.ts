
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  email?: string;
  phone?: string;
  unit_id?: string;
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, isAdmin, isSupervisor } = useAuthContext();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('name');

      // Se não é admin/supervisor, filtrar por unidade do usuário
      if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
        console.log('Filtering doctors by unit_id:', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
      
      console.log('Fetched doctors:', data?.length || 0);
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      console.log('Profile loaded, fetching doctors for unit:', profile.unit_id);
      fetchDoctors();
    }
  }, [profile?.unit_id, isAdmin, isSupervisor]);

  return {
    doctors,
    loading,
    refreshDoctors: fetchDoctors,
  };
};
