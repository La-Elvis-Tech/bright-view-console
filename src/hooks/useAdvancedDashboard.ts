
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { subDays, format } from 'date-fns';

interface DashboardMetrics {
  totalExams: number;
  todayExams: number;
  weeklyGrowth: number;
  criticalStock: number;
  expiringSoon: number;
  averageExamTime: number;
}

interface ExamTrend {
  date: string;
  count: number;
  revenue: number;
}

interface RecentExam {
  id: string;
  patient_name: string;
  exam_type: string;
  status: string;
  created_at: string;
  doctor_name: string;
}

interface SystemLog {
  id: string;
  action: string;
  resource_type: string;
  user_name: string;
  created_at: string;
  details: any;
}

export const useAdvancedDashboard = () => {
  const { profile } = useAuthContext();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics', profile?.unit_id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!profile?.unit_id) {
        return {
          totalExams: 0,
          todayExams: 0,
          weeklyGrowth: 0,
          criticalStock: 0,
          expiringSoon: 0,
          averageExamTime: 0
        };
      }

      const today = new Date();
      const yesterday = subDays(today, 1);
      const weekAgo = subDays(today, 7);

      // Consultas paralelas para métricas da unidade específica
      const [
        { data: todayExams },
        { data: yesterdayExams },
        { data: weekExams },
        { data: criticalItems },
        { data: expiringItems },
        { data: avgDuration }
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('id')
          .gte('created_at', format(today, 'yyyy-MM-dd'))
          .eq('unit_id', profile.unit_id),
        
        supabase
          .from('appointments')
          .select('id')
          .gte('created_at', format(yesterday, 'yyyy-MM-dd'))
          .lt('created_at', format(today, 'yyyy-MM-dd'))
          .eq('unit_id', profile.unit_id),
        
        supabase
          .from('appointments')
          .select('id')
          .gte('created_at', format(weekAgo, 'yyyy-MM-dd'))
          .eq('unit_id', profile.unit_id),
        
        supabase
          .from('inventory_items')
          .select('id, current_stock, min_stock')
          .eq('unit_id', profile.unit_id)
          .eq('active', true),
        
        supabase
          .from('inventory_items')
          .select('id')
          .gte('expiry_date', format(today, 'yyyy-MM-dd'))
          .lte('expiry_date', format(subDays(today, -30), 'yyyy-MM-dd'))
          .eq('unit_id', profile.unit_id)
          .eq('active', true),
        
        supabase
          .from('exam_types')
          .select('duration_minutes')
          .eq('unit_id', profile.unit_id)
          .eq('active', true)
      ]);

      // Filtrar itens de estoque crítico manualmente
      const criticalStockCount = criticalItems?.filter(item => 
        item.current_stock < item.min_stock
      ).length || 0;

      const avgTime = avgDuration?.reduce((acc, exam) => acc + (exam.duration_minutes || 0), 0) / (avgDuration?.length || 1);
      const weeklyGrowth = yesterdayExams?.length ? 
        ((todayExams?.length || 0) - (yesterdayExams?.length || 0)) / (yesterdayExams?.length || 1) * 100 : 0;

      return {
        totalExams: weekExams?.length || 0,
        todayExams: todayExams?.length || 0,
        weeklyGrowth: Math.round(weeklyGrowth),
        criticalStock: criticalStockCount,
        expiringSoon: expiringItems?.length || 0,
        averageExamTime: Math.round(avgTime || 0)
      };
    },
    enabled: !!profile?.unit_id
  });

  const { data: examTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['exam-trends', profile?.unit_id],
    queryFn: async (): Promise<ExamTrend[]> => {
      if (!profile?.unit_id) return [];

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const trends = await Promise.all(
        last7Days.map(async (date) => {
          const { data: exams } = await supabase
            .from('appointments')
            .select('cost')
            .gte('created_at', date)
            .lt('created_at', format(subDays(new Date(date), -1), 'yyyy-MM-dd'))
            .eq('unit_id', profile.unit_id);

          return {
            date,
            count: exams?.length || 0,
            revenue: exams?.reduce((acc, exam) => acc + (exam.cost || 0), 0) || 0
          };
        })
      );

      return trends;
    },
    enabled: !!profile?.unit_id
  });

  const { data: recentExams, isLoading: examsLoading } = useQuery({
    queryKey: ['recent-exams', profile?.unit_id],
    queryFn: async (): Promise<RecentExam[]> => {
      if (!profile?.unit_id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          status,
          created_at,
          exam_types(name),
          doctors(name)
        `)
        .eq('unit_id', profile.unit_id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      return data?.map(exam => ({
        id: exam.id,
        patient_name: exam.patient_name,
        exam_type: exam.exam_types?.name || 'N/A',
        status: exam.status,
        created_at: exam.created_at,
        doctor_name: exam.doctors?.name || 'N/A'
      })) || [];
    },
    enabled: !!profile?.unit_id
  });

  const { data: systemLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['system-logs', profile?.unit_id],
    queryFn: async (): Promise<SystemLog[]> => {
      if (!profile?.unit_id) return [];

      // Buscar logs relacionados à unidade do usuário
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          resource_type,
          created_at,
          details,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filtrar logs por usuários da mesma unidade
      const { data: unitUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('unit_id', profile.unit_id);

      const unitUserIds = unitUsers?.map(user => user.id) || [];
      const filteredLogs = data?.filter(log => 
        log.user_id && unitUserIds.includes(log.user_id)
      ) || [];

      // Buscar nomes dos usuários
      const userIds = filteredLogs.map(log => log.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      return filteredLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource_type: log.resource_type,
        created_at: log.created_at,
        details: log.details,
        user_name: profiles?.find(p => p.id === log.user_id)?.full_name || 'Sistema'
      }));
    },
    enabled: !!profile?.unit_id
  });

  return {
    metrics,
    examTrends,
    recentExams,
    systemLogs,
    loading: metricsLoading || trendsLoading || examsLoading || logsLoading
  };
};
