
export interface Appointment {
  id: string;
  patient: string;
  type: string;
  date: Date;
  doctor: string;
  unit: string;
  cost: number;
  status: string;
}

export interface UnitSummary {
  name: string;
  count: number;
  appointments: Appointment[];
}

export interface SupabaseAppointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  exam_type_id: string;
  doctor_id: string;
  unit_id: string;
  scheduled_date: string;
  duration_minutes: number;
  cost?: number;
  status: 'Agendado' | 'Confirmado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  exam_types?: {
    name: string;
    category: string;
    duration_minutes: number;
    cost?: number;
  };
  doctors?: {
    name: string;
    specialty: string;
    crm: string;
  };
  units?: {
    name: string;
    code: string;
  };
}
