
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupabaseAppointment } from '@/types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<SupabaseAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          exam_types(name, category, duration_minutes, cost),
          doctors(name, specialty, crm),
          units(name, code)
        `)
        .order('scheduled_date', { ascending: false });

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
      setLoading(true);
      await fetchAppointments();
      setLoading(false);
    };

    loadAppointments();
  }, []);

  return {
    appointments,
    loading,
    refreshAppointments: fetchAppointments,
  };
};
