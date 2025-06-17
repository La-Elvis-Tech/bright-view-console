
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { SupabaseAppointment } from '@/types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<SupabaseAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile, isAdmin, isSupervisor } = useAuthContext();

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          exam_types(name, category, duration_minutes, cost),
          doctors(name, specialty, crm),
          units(name, code)
        `)
        .order('scheduled_date', { ascending: false });

      // Se não é admin/supervisor, filtrar por unidade
      if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const typedAppointments: SupabaseAppointment[] = (data || []).map(item => ({
        ...item,
        status: item.status as SupabaseAppointment['status']
      }));
      
      setAppointments(typedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      if (profile) {
        setLoading(true);
        await fetchAppointments();
        setLoading(false);
      }
    };

    loadAppointments();
  }, [profile?.unit_id, isAdmin, isSupervisor]);

  return {
    appointments,
    loading,
    refreshAppointments: fetchAppointments,
  };
};
