
import { SupabaseAppointment } from '@/types/appointment';

export interface Appointment {
  id: string;
  patient: string;
  type: string;
  date: Date;
  doctor: string;
  laboratory: string;
  unit: string;
  cost: number;
  status: string;
  result: string;
}

export const adaptSupabaseAppointmentToAppointment = (supabaseAppointment: SupabaseAppointment): Appointment => {
  return {
    id: supabaseAppointment.id,
    patient: supabaseAppointment.patient_name,
    type: supabaseAppointment.exam_types?.name || 'Exame não especificado',
    date: new Date(supabaseAppointment.scheduled_date),
    doctor: supabaseAppointment.doctors?.name || 'Médico não especificado',
    laboratory: 'Laboratório Central',
    unit: supabaseAppointment.units?.name || 'Unidade não especificada',
    cost: Number(supabaseAppointment.cost || supabaseAppointment.exam_types?.cost || 0),
    status: supabaseAppointment.status,
    result: supabaseAppointment.status === 'Concluído' ? 'Normal' : 'Pendente'
  };
};

export const adaptSupabaseAppointmentsToAppointments = (supabaseAppointments: SupabaseAppointment[]): Appointment[] => {
  return supabaseAppointments.map(adaptSupabaseAppointmentToAppointment);
};
