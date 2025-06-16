
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

    // Calcular volume de sangue se houver exames de sangue
    let bloodVolumeData = null;
    if (appointment.blood_exams && appointment.blood_exams.length > 0) {
      bloodVolumeData = await bloodExamService.calculateBloodVolume(appointment.blood_exams);
    }

    // Validar materiais primeiro
    const materialValidation = await this.calculateExamMaterials(
      appointment.exam_type_id, 
      appointment.blood_exams || []
    );
    
    if (!materialValidation.canSchedule) {
      throw new Error(`Estoque insuficiente: ${materialValidation.insufficientMaterials.join(', ')}`);
    }

    const appointmentData = {
      ...appointment,
      blood_exams: appointment.blood_exams || [],
      total_blood_volume_ml: bloodVolumeData?.total_volume_ml || 0,
      estimated_tubes_needed: bloodVolumeData?.tubes_needed || 0,
      cost: materialValidation.totalEstimatedCost,
      created_by: userData.user.id,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw error;

    // Reservar materiais
    await bloodExamService.reserveMaterialsForAppointment(data.id, materialValidation.materials);

    return data;
  },

  async updateAppointment(id: string, updates: Partial<SupabaseAppointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Se o status foi alterado para "Concluído", atualizar o inventário
    if (updates.status === 'Concluído') {
      await bloodExamService.updateInventoryAfterExam(id);
    }

    // Se o status foi alterado para "Cancelado", liberar materiais reservados
    if (updates.status === 'Cancelado') {
      await bloodExamService.releaseMaterialsForAppointment(id);
    }

    return data;
  },

  async deleteAppointment(id: string) {
    // Liberar materiais reservados antes de deletar
    await bloodExamService.releaseMaterialsForAppointment(id);

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
