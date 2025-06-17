
import { SupabaseAppointment } from '@/types/appointment';

// Normalizar dados de agendamentos para relatórios
export const normalizeAppointmentData = (appointments: SupabaseAppointment[]) => {
  return appointments
    .filter(appointment => 
      appointment &&
      appointment.id &&
      appointment.patient_name &&
      appointment.scheduled_date
    )
    .map(appointment => ({
      id: appointment.id,
      patient_name: appointment.patient_name.trim(),
      scheduled_date: appointment.scheduled_date,
      cost: Number(appointment.cost || appointment.exam_types?.cost || 0),
      status: appointment.status || 'Agendado',
      exam_type: appointment.exam_types?.name?.trim() || 'Não especificado',
      exam_category: appointment.exam_types?.category?.trim() || 'Outros',
      doctor_name: appointment.doctors?.name?.trim() || 'Não especificado',
      doctor_specialty: appointment.doctors?.specialty?.trim() || 'Clínica Geral',
      unit_name: appointment.units?.name?.trim() || 'Não especificado',
      created_at: appointment.created_at,
      duration_minutes: appointment.duration_minutes || 30
    }));
};

// Calcular métricas para gráficos
export const calculateReportMetrics = (normalizedAppointments: ReturnType<typeof normalizeAppointmentData>) => {
  const totalAppointments = normalizedAppointments.length;
  const completedAppointments = normalizedAppointments.filter(app => app.status === 'Concluído');
  const totalRevenue = completedAppointments.reduce((sum, app) => sum + app.cost, 0);
  
  // Agrupamentos para gráficos
  const appointmentsByStatus = normalizedAppointments.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appointmentsByExamType = normalizedAppointments.reduce((acc, app) => {
    acc[app.exam_type] = (acc[app.exam_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const revenueByMonth = normalizedAppointments
    .filter(app => app.status === 'Concluído')
    .reduce((acc, app) => {
      const month = new Date(app.scheduled_date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + app.cost;
      return acc;
    }, {} as Record<string, number>);

  return {
    totalAppointments,
    completedAppointments: completedAppointments.length,
    totalRevenue,
    averageCost: completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0,
    appointmentsByStatus,
    appointmentsByExamType,
    revenueByMonth
  };
};
