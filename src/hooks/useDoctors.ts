
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
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('name');

      // Se não é admin/supervisor, filtrar por unidade
      if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDoctors();
    }
  }, [profile?.unit_id, isAdmin, isSupervisor]);

  return {
    doctors,
    loading,
    refreshDoctors: fetchDoctors,
  };
};
