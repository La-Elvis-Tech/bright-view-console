
import { useAppointments } from './useAppointments';
import { useExamTypes } from './useExamTypes';
import { useDoctors } from './useDoctors';
import { useUnits } from './useUnits';
import { appointmentService } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAppointments = () => {
  const { appointments, loading: appointmentsLoading, refreshAppointments } = useAppointments();
  const { examTypes, refreshExamTypes } = useExamTypes();
  const { doctors, refreshDoctors } = useDoctors();
  const { units, refreshUnits } = useUnits();
  const { toast } = useToast();

  const createAppointment = async (appointment: Parameters<typeof appointmentService.createAppointment>[0]) => {
    try {
      const data = await appointmentService.createAppointment(appointment);
      await refreshAppointments();
      
      toast({
        title: 'Agendamento criado',
        description: `Agendamento para ${appointment.patient_name} foi criado com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Parameters<typeof appointmentService.updateAppointment>[1]) => {
    try {
      const data = await appointmentService.updateAppointment(id, updates);
      await refreshAppointments();
      
      if (updates.status === 'Cancelado') {
        toast({
          title: 'Agendamento cancelado',
          description: 'O agendamento foi cancelado com sucesso.',
        });
      } else if (updates.status === 'Concluído') {
        toast({
          title: 'Exame concluído',
          description: 'O exame foi concluído com sucesso.',
        });
      } else {
        toast({
          title: 'Agendamento atualizado',
          description: 'As informações foram salvas com sucesso.',
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      await refreshAppointments();
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createDoctor = async (doctorData: {
    name: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert({
          ...doctorData,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await refreshDoctors();
      
      toast({
        title: 'Médico criado',
        description: `Dr(a). ${doctorData.name} foi adicionado com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o médico.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateDoctor = async (id: string, updates: {
    name?: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refreshDoctors();
      
      toast({
        title: 'Médico atualizado',
        description: 'As informações do médico foram atualizadas com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o médico.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      await refreshDoctors();
      
      toast({
        title: 'Médico removido',
        description: 'O médico foi removido com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o médico.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createExamType = async (examTypeData: {
    name: string;
    category?: string;
    description?: string;
    duration_minutes?: number;
    cost?: number;
    requires_preparation?: boolean;
    preparation_instructions?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('exam_types')
        .insert({
          ...examTypeData,
          duration_minutes: examTypeData.duration_minutes || 30,
          requires_preparation: examTypeData.requires_preparation || false,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await refreshExamTypes();
      
      toast({
        title: 'Tipo de exame criado',
        description: `${examTypeData.name} foi adicionado com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating exam type:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o tipo de exame.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateExamType = async (id: string, updates: {
    name?: string;
    category?: string;
    description?: string;
    duration_minutes?: number;
    cost?: number;
    requires_preparation?: boolean;
    preparation_instructions?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('exam_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refreshExamTypes();
      
      toast({
        title: 'Tipo de exame atualizado',
        description: 'As informações foram atualizadas com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error updating exam type:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o tipo de exame.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteExamType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exam_types')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      await refreshExamTypes();
      
      toast({
        title: 'Tipo de exame removido',
        description: 'O tipo de exame foi removido com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting exam type:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o tipo de exame.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    appointments,
    examTypes,
    doctors,
    units,
    loading: appointmentsLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    createExamType,
    updateExamType,
    deleteExamType,
    refreshAppointments,
    refreshExamTypes,
    refreshDoctors,
    refreshUnits,
  };
};

// Re-export types for backward compatibility
export type { ExamType } from './useExamTypes';
export type { Doctor } from './useDoctors';
export type { Unit } from './useUnits';
export type { SupabaseAppointment } from '@/types/appointment';
