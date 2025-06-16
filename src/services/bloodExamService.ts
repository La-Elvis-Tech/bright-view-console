
import { supabase } from '@/integrations/supabase/client';
import { BloodVolumeCalculation, DetailedMaterialValidation } from '@/types/bloodExam';

export const bloodExamService = {
  async calculateBloodVolume(examIds: string[]): Promise<BloodVolumeCalculation | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_blood_volume_needed', {
        p_exam_ids: examIds
      });

      if (error) throw error;
      
      if (data && data[0]) {
        const result = data[0];
        const examDetails = Array.isArray(result.exam_details) 
          ? result.exam_details.map((detail: any) => ({
              exam_id: String(detail.exam_id || ''),
              name: String(detail.name || ''),
              volume_ml: Number(detail.volume_ml || 0),
              tube_type: String(detail.tube_type || '')
            }))
          : [];

        return {
          total_volume_ml: result.total_volume_ml,
          tubes_needed: result.tubes_needed,
          exam_details: examDetails
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating blood volume:', error);
      throw error;
    }
  },

  async validateMaterialsForExam(
    examTypeId: string, 
    bloodExamIds: string[] = []
  ): Promise<DetailedMaterialValidation[]> {
    try {
      const { data, error } = await supabase.rpc('calculate_detailed_exam_materials', {
        p_exam_type_id: examTypeId,
        p_blood_exams: bloodExamIds
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error validating materials:', error);
      throw error;
    }
  },

  async reserveMaterialsForAppointment(appointmentId: string, materials: DetailedMaterialValidation[]) {
    try {
      const reservations = materials.map(material => ({
        appointment_id: appointmentId,
        inventory_item_id: material.inventory_item_id,
        quantity_used: material.quantity_required,
        cost_per_unit: material.estimated_cost / material.quantity_required,
        total_cost: material.estimated_cost
      }));

      const { error } = await supabase
        .from('appointment_inventory')
        .insert(reservations);

      if (error) throw error;
    } catch (error) {
      console.error('Error reserving materials:', error);
      throw error;
    }
  },

  async releaseMaterialsForAppointment(appointmentId: string) {
    try {
      const { error } = await supabase
        .from('appointment_inventory')
        .delete()
        .eq('appointment_id', appointmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error releasing materials:', error);
      throw error;
    }
  },

  async updateInventoryAfterExam(appointmentId: string) {
    try {
      // Buscar materiais reservados
      const { data: reservedMaterials, error: fetchError } = await supabase
        .from('appointment_inventory')
        .select('*')
        .eq('appointment_id', appointmentId);

      if (fetchError) throw fetchError;

      // Atualizar estoque para cada material
      for (const material of reservedMaterials || []) {
        // First get current stock
        const { data: currentItem, error: getCurrentError } = await supabase
          .from('inventory_items')
          .select('current_stock')
          .eq('id', material.inventory_item_id)
          .single();

        if (getCurrentError) throw getCurrentError;

        // Calculate new stock
        const newStock = currentItem.current_stock - material.quantity_used;

        // Update stock
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ current_stock: newStock })
          .eq('id', material.inventory_item_id);

        if (updateError) throw updateError;

        // Registrar movimento de saída
        const { data: userData } = await supabase.auth.getUser();
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            item_id: material.inventory_item_id,
            movement_type: 'out',
            quantity: material.quantity_used,
            unit_cost: material.cost_per_unit,
            total_cost: material.total_cost,
            reason: `Consumo em exame - Agendamento ${appointmentId}`,
            reference_type: 'appointment',
            reference_id: appointmentId,
            performed_by: userData.user?.id || ''
          });

        if (movementError) throw movementError;
      }
    } catch (error) {
      console.error('Error updating inventory after exam:', error);
      throw error;
    }
  }
};
