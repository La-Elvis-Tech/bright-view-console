
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentActivity {
  title: string;
  description: string;
  time: string;
  day: string;
  date: string;
  paciente?: string;
  responsavel?: string;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      // Buscar agendamentos recentes
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          scheduled_date,
          status,
          created_at,
          exam_types(name),
          doctors(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar movimentações de estoque recentes
      const { data: movements } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          movement_type,
          quantity,
          created_at,
          reason,
          inventory_items(name),
          performed_by
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      // Processar agendamentos
      appointments?.forEach(appointment => {
        const date = new Date(appointment.created_at);
        activities.push({
          title: `Agendamento ${appointment.status}`,
          description: `${appointment.exam_types?.name || 'Exame'} agendado`,
          time: format(date, 'HH:mm'),
          day: format(date, 'EEEE', { locale: ptBR }),
          date: format(date, 'dd/MM'),
          paciente: appointment.patient_name,
          responsavel: appointment.doctors?.name
        });
      });

      // Processar movimentações
      movements?.forEach(movement => {
        const date = new Date(movement.created_at);
        const isInput = movement.movement_type === 'entrada';
        activities.push({
          title: `${isInput ? 'Entrada' : 'Saída'} de Estoque`,
          description: `${movement.quantity} unidades - ${movement.inventory_items?.name}`,
          time: format(date, 'HH:mm'),
          day: format(date, 'EEEE', { locale: ptBR }),
          date: format(date, 'dd/MM'),
          responsavel: movement.performed_by
        });
      });

      // Ordenar por data mais recente e limitar
      return activities
        .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
        .slice(0, 8);
    }
  });
};
