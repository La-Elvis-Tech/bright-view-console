
import { supabase } from '@/integrations/supabase/client';
import { ExamDetails, ExamMaterial } from '@/types/examDetails';

export const examDetailsService = {
  async getExamDetails(examTypeId: string): Promise<ExamDetails | null> {
    try {
      // Buscar dados básicos do exame
      const { data: examData, error: examError } = await supabase
        .from('exam_types')
        .select('*')
        .eq('id', examTypeId)
        .eq('active', true)
        .single();

      if (examError) throw examError;
      if (!examData) return null;

      // Buscar materiais necessários para o exame usando a função do banco
      let materials: ExamMaterial[] = [];
      let totalMaterialCost = 0;
      let materialsAvailable = true;

      try {
        const { data: materialsData, error: materialsError } = await supabase
          .rpc('calculate_exam_materials', {
            p_exam_type_id: examTypeId
          });

        if (!materialsError && materialsData) {
          materials = materialsData.map((material: any) => ({
            inventory_item_id: material.inventory_item_id,
            item_name: material.item_name,
            quantity_required: material.quantity_required,
            current_stock: material.current_stock,
            available_stock: material.available_stock,
            sufficient_stock: material.sufficient_stock,
            estimated_cost: material.estimated_cost,
            material_type: 'consumable'
          }));
          
          totalMaterialCost = materials.reduce((sum, material) => sum + material.estimated_cost, 0);
          materialsAvailable = materials.every(material => material.sufficient_stock);
        }
      } catch (error) {
        console.warn('Error fetching materials for exam:', error);
        // Continue without materials data
      }

      return {
        id: examData.id,
        name: examData.name,
        description: examData.description,
        category: examData.category,
        duration_minutes: examData.duration_minutes,
        cost: examData.cost,
        preparation: {
          requires_preparation: examData.requires_preparation,
          preparation_instructions: examData.preparation_instructions
        },
        materials,
        total_material_cost: totalMaterialCost,
        materials_available: materialsAvailable
      };
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw error;
    }
  },

  async getAllExamsWithMaterials(): Promise<ExamDetails[]> {
    try {
      // Buscar informações do usuário para filtrar por unidade
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        console.warn('No user found, returning empty array');
        return [];
      }

      // Buscar perfil do usuário para obter unit_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return [];
      }

      let query = supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      // Filtrar por unidade do usuário se disponível
      if (profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data: exams, error } = await query;

      if (error) throw error;

      // Buscar detalhes para cada exame
      const examDetails = await Promise.all(
        (exams || []).map(async (exam) => {
          try {
            const details = await this.getExamDetails(exam.id);
            return details;
          } catch (error) {
            console.error(`Error fetching details for exam ${exam.id}:`, error);
            // Retornar dados básicos do exame mesmo sem materiais
            return {
              id: exam.id,
              name: exam.name,
              description: exam.description,
              category: exam.category,
              duration_minutes: exam.duration_minutes,
              cost: exam.cost,
              preparation: {
                requires_preparation: exam.requires_preparation,
                preparation_instructions: exam.preparation_instructions
              },
              materials: [],
              total_material_cost: 0,
              materials_available: true
            };
          }
        })
      );

      return examDetails.filter(Boolean) as ExamDetails[];
    } catch (error) {
      console.error('Error fetching all exams with materials:', error);
      throw error;
    }
  },

  async validateExamMaterials(examTypeId: string): Promise<{
    canPerform: boolean;
    missingMaterials: ExamMaterial[];
    totalCost: number;
  }> {
    try {
      const examDetails = await this.getExamDetails(examTypeId);
      if (!examDetails) {
        return { canPerform: false, missingMaterials: [], totalCost: 0 };
      }

      const missingMaterials = examDetails.materials.filter(
        material => !material.sufficient_stock
      );

      return {
        canPerform: missingMaterials.length === 0,
        missingMaterials,
        totalCost: examDetails.total_material_cost
      };
    } catch (error) {
      console.error('Error validating exam materials:', error);
      throw error;
    }
  }
};
