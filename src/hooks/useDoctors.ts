
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  crm?: string;
  email?: string;
  phone?: string;
  unit_id?: string;
  active: boolean;
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile, hasRole } = useAuthContext();

  const fetchDoctors = async () => {
    try {
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('name');

      // Se não é admin/supervisor, filtrar por unidade
      if (!hasRole('admin') && !hasRole('supervisor') && profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar e validar dados mais rigorosamente
      const validDoctors = (data || [])
        .filter(doctor => 
          doctor && 
          doctor.id && 
          typeof doctor.id === 'string' && 
          doctor.id.trim() !== '' &&
          doctor.name && 
          typeof doctor.name === 'string' && 
          doctor.name.trim() !== ''
        )
        .map(doctor => ({
          ...doctor,
          id: doctor.id.trim(),
          name: doctor.name.trim(),
          specialty: doctor.specialty?.trim() || undefined,
          crm: doctor.crm?.trim() || undefined,
          email: doctor.email?.trim() || undefined,
          phone: doctor.phone?.trim() || undefined,
          active: Boolean(doctor.active)
        }));

      console.log('Doctors loaded:', validDoctors.length);
      setDoctors(validDoctors);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os médicos.',
        variant: 'destructive',
      });
      setDoctors([]);
    }
  };

  useEffect(() => {
    const loadDoctors = async () => {
      if (profile) {
        setLoading(true);
        await fetchDoctors();
        setLoading(false);
      }
    };

    loadDoctors();
  }, [profile?.unit_id, hasRole]);

  return {
    doctors,
    loading,
    refreshDoctors: fetchDoctors,
  };
};
