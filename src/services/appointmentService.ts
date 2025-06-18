
import { supabase } from '@/integrations/supabase/client';
import { SupabaseAppointment } from '@/types/appointment';
import { bloodExamService } from './bloodExamService';

export interface ExamMaterial {
  inventory_item_id: string;
  item_name: string;
  quantity_required: number;
  current_stock: number;
  available_stock: number;
  sufficient_stock: boolean;
  estimated_cost: number;
}

export interface MaterialValidation {
  canSchedule: boolean;
  insufficientMaterials: string[];
  totalEstimatedCost: number;
  materials: ExamMaterial[];
}

export const appointmentService = {
  async calculateExamMaterials(examTypeId: string, bloodExamIds: string[] = []): Promise<MaterialValidation> {
    try {
      const materials = await bloodExamService.validateMaterialsForExam(examTypeId, bloodExamIds);
      
      const insufficientMaterials = materials
        .filter(m => !m.sufficient_stock)
        .map(m => `${m.item_name} (necessário: ${m.quantity_required}, disponível: ${m.available_stock})`);
      
      const totalEstimatedCost = materials.reduce((sum, m) => sum + Number(m.estimated_cost || 0), 0);

      return {
        canSchedule: insufficientMaterials.length === 0,
        insufficientMaterials,
        totalEstimatedCost,
        materials: materials.map(m => ({
          inventory_item_id: m.inventory_item_id,
          item_name: m.item_name,
          quantity_required: m.quantity_required,
          current_stock: m.current_stock,
          available_stock: m.available_stock,
          sufficient_stock: m.sufficient_stock,
          estimated_cost: m.estimated_cost
        }))
      };
    } catch (error) {
      console.error('Error calculating exam materials:', error);
      throw error;
    }
  },

  async createAppointment(appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { blood_exams?: string[] }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    console.log('Creating appointment:', appointment);

    // Calcular volume de sangue se houver exames de sangue
    let bloodVolumeData = null;
    if (appointment.blood_exams && appointment.blood_exams.length > 0) {
      bloodVolumeData = await bloodExamService.calculateBloodVolume(appointment.blood_exams);
    }

    // Validar se existem materiais para o exame
    let materialValidation = { canSchedule: true, totalEstimatedCost: 0, materials: [], insufficientMaterials: [] };
    try {
      materialValidation = await this.calculateExamMaterials(
        appointment.exam_type_id, 
        appointment.blood_exams || []
      );
    } catch (error) {
      console.warn('Could not validate materials, proceeding without validation:', error);
    }

    const appointmentData = {
      ...appointment,
      blood_exams: appointment.blood_exams || [],
      total_blood_volume_ml: bloodVolumeData?.total_volume_ml || 0,
      estimated_tubes_needed: bloodVolumeData?.tubes_needed || 0,
      cost: materialValidation.totalEstimatedCost,
      created_by: userData.user.id,
    };

    console.log('Appointment data to insert:', appointmentData);

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
      console.error('Error creating appointment:', error);
      throw error;
    }

    console.log('Appointment created successfully:', data);

    // Tentar reservar materiais se disponíveis
    if (materialValidation.materials.length > 0) {
      try {
        await bloodExamService.reserveMaterialsForAppointment(data.id, materialValidation.materials);
      } catch (error) {
        console.warn('Could not reserve materials, but appointment was created:', error);
      }
    }

    return data;
  },

  async updateAppointment(id: string, updates: Partial<SupabaseAppointment>) {
    console.log('Updating appointment:', id, updates);
    
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

    // Se o status foi alterado para "Concluído", atualizar o inventário
    if (updates.status === 'Concluído') {
      try {
        await bloodExamService.updateInventoryAfterExam(id);
      } catch (error) {
        console.warn('Could not update inventory after exam completion:', error);
      }
    }

    // Se o status foi alterado para "Cancelado", liberar materiais reservados
    if (updates.status === 'Cancelado') {
      try {
        await bloodExamService.releaseMaterialsForAppointment(id);
      } catch (error) {
        console.warn('Could not release materials for cancelled appointment:', error);
      }
    }

    return data;
  },

  async deleteAppointment(id: string) {
    console.log('Deleting appointment:', id);
    
    // Tentar liberar materiais reservados antes de deletar
    try {
      await bloodExamService.releaseMaterialsForAppointment(id);
    } catch (error) {
      console.warn('Could not release materials before deletion:', error);
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
