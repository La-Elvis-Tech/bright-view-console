
import { supabase } from '@/integrations/supabase/client';
import { SupabaseAppointment } from '@/types/appointment';

// Interface que corresponde exatamente à estrutura da tabela appointments
interface AppointmentInsert {
  patient_name: string;
  patient_email?: string | null;
  patient_phone?: string | null;
  exam_type_id: string;
  doctor_id: string;
  unit_id: string;
  scheduled_date: string;
  duration_minutes?: number;
  status?: 'Agendado' | 'Confirmado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  cost?: number | null;
  notes?: string | null;
  created_by: string;
}

export const appointmentService = {
  async createAppointment(appointment: AppointmentInsert) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating appointment with data:', appointment);

    // Validar dados obrigatórios conforme tabela
    if (!appointment.patient_name?.trim()) {
      throw new Error('Nome do paciente é obrigatório');
    }
    if (!appointment.exam_type_id) {
      throw new Error('Tipo de exame é obrigatório');
    }
    if (!appointment.doctor_id) {
      throw new Error('Médico é obrigatório');
    }
    if (!appointment.unit_id) {
      throw new Error('Unidade é obrigatória');
    }
    if (!appointment.scheduled_date) {
      throw new Error('Data de agendamento é obrigatória');
    }
    if (!appointment.created_by) {
      throw new Error('Usuário criador é obrigatório');
    }

    // Verificar se as foreign keys existem antes de inserir
    console.log('Validating foreign key references...');
    
    // Verificar se o médico existe
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id, name')
      .eq('id', appointment.doctor_id)
      .eq('active', true)
      .single();

    if (doctorError || !doctor) {
      console.error('Doctor validation failed:', doctorError);
      throw new Error('Médico selecionado não existe ou está inativo');
    }

    // Verificar se o tipo de exame existe
    const { data: examType, error: examTypeError } = await supabase
      .from('exam_types')
      .select('id, name')
      .eq('id', appointment.exam_type_id)
      .eq('active', true)
      .single();

    if (examTypeError || !examType) {
      console.error('Exam type validation failed:', examTypeError);
      throw new Error('Tipo de exame selecionado não existe ou está inativo');
    }

    // Verificar se a unidade existe
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', appointment.unit_id)
      .eq('active', true)
      .single();

    if (unitError || !unit) {
      console.error('Unit validation failed:', unitError);
      throw new Error('Unidade selecionada não existe ou está inativa');
    }

    console.log('Foreign key validation passed:', {
      doctor: doctor.name,
      examType: examType.name,
      unit: unit.name
    });

    // Montar dados para inserção seguindo exatamente a estrutura da tabela
    const appointmentData: AppointmentInsert = {
      patient_name: appointment.patient_name.trim(),
      patient_email: appointment.patient_email?.trim() || null,
      patient_phone: appointment.patient_phone?.trim() || null,
      exam_type_id: appointment.exam_type_id,
      doctor_id: appointment.doctor_id,
      unit_id: appointment.unit_id,
      scheduled_date: appointment.scheduled_date,
      duration_minutes: appointment.duration_minutes || 30,
      status: appointment.status || 'Agendado',
      cost: appointment.cost || null,
      notes: appointment.notes?.trim() || null,
      created_by: appointment.created_by
    };

    console.log('Final appointment data for insertion:', appointmentData);

    // Inserir na tabela appointments
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select(`
        *,
        exam_types(name, category, duration_minutes, cost),
        doctors(name, specialty, crm),
        units(name, code)
      `)
      .single();

    if (error) {
      console.error('Error inserting appointment:', error);
      
      // Tratar erros específicos
      if (error.code === '23505') {
        throw new Error('Já existe um agendamento com esses dados');
      } else if (error.code === '23503') {
        if (error.message.includes('doctor_id')) {
          throw new Error('Médico selecionado não é válido');
        } else if (error.message.includes('exam_type_id')) {
          throw new Error('Tipo de exame selecionado não é válido');
        } else if (error.message.includes('unit_id')) {
          throw new Error('Unidade selecionada não é válida');
        } else if (error.message.includes('created_by')) {
          throw new Error('Usuário não autorizado');
        } else {
          throw new Error('Referência de dados inválida');
        }
      } else if (error.code === '23514') {
        throw new Error('Status de agendamento inválido');
      } else if (error.message.includes('row-level security')) {
        throw new Error('Você não tem permissão para criar agendamentos nesta unidade');
      } else {
        throw new Error(error.message || 'Erro ao criar agendamento');
      }
    }

    console.log('Appointment created successfully:', data);
    return data;
  },

  async updateAppointment(id: string, updates: Partial<SupabaseAppointment>) {
    console.log('Updating appointment:', id, updates);
    
    // Validar se o agendamento existe
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      throw new Error('Agendamento não encontrado');
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        exam_types(name, category, duration_minutes, cost),
        doctors(name, specialty, crm),
        units(name, code)
      `)
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }

    console.log('Appointment updated successfully:', data);
    return data;
  },

  async deleteAppointment(id: string) {
    console.log('Deleting appointment:', id);
    
    // Verificar se o agendamento existe
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      throw new Error('Agendamento não encontrado');
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }

    console.log('Appointment deleted successfully');
  }
};
