
import { useQuery } from '@tanstack/react-query';
import { useAppointments } from './useAppointments';
import { normalizeAppointmentData, calculateReportMetrics } from '@/utils/reportDataNormalizer';

export const useNormalizedReportsData = () => {
  const { appointments, loading: appointmentsLoading } = useAppointments();

  return useQuery({
    queryKey: ['normalized-reports-data', appointments.length],
    queryFn: () => {
      console.log('Normalizing appointments data for reports:', appointments.length);
      
      const normalizedAppointments = normalizeAppointmentData(appointments);
      const metrics = calculateReportMetrics(normalizedAppointments);
      
      console.log('Normalized data:', {
        originalCount: appointments.length,
        normalizedCount: normalizedAppointments.length,
        metrics
      });

      return {
        appointments: normalizedAppointments,
        metrics,
        chartData: {
          statusChart: Object.entries(metrics.appointmentsByStatus).map(([name, value]) => ({ name, value })),
          examTypeChart: Object.entries(metrics.appointmentsByExamType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value })),
          revenueChart: Object.entries(metrics.revenueByMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, revenue]) => ({ 
              month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
              revenue 
            }))
        }
      };
    },
    enabled: !appointmentsLoading && appointments.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};
