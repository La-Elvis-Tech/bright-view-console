
import { supabase } from '@/integrations/supabase/client';
import { ExamDetails, ExamMaterial } from '@/types/examDetails';

export const examDetailsService = {
  async getExamDetails(examTypeId: string): Promise<ExamDetails | null> {
    try {
      console.log('Buscando detalhes do exame:', examTypeId);

      // Buscar dados básicos do exame
      const { data: examData, error: examError } = await supabase
        .from('exam_types')
        .select('*')
        .eq('id', examTypeId)
        .single();

      if (examError) {
        console.error('Erro ao buscar exame:', examError);
        throw examError;
      }
      if (!examData) return null;

      console.log('Dados do exame encontrados:', examData);

      // Buscar materiais necessários para o exame
      const { data: materialsData, error: materialsError } = await supabase
        .rpc('calculate_detailed_exam_materials', {
          p_exam_type_id: examTypeId,
          p_blood_exams: []
        });

      if (materialsError) {
        console.error('Erro ao buscar materiais:', materialsError);
        // Se não conseguir buscar materiais, continuar sem eles
      }

      const materials: ExamMaterial[] = materialsData?.map(material => ({
        inventory_item_id: material.inventory_item_id,
        item_name: material.item_name,
        quantity_required: material.quantity_required,
        current_stock: material.current_stock,
        reserved_stock: material.reserved_stock || 0,
        available_stock: material.available_stock,
        sufficient_stock: material.sufficient_stock,
        estimated_cost: material.estimated_cost,
        material_type: material.material_type
      })) || [];

      const totalMaterialCost = materials.reduce((sum, material) => sum + material.estimated_cost, 0);
      const materialsAvailable = materials.length === 0 || materials.every(material => material.sufficient_stock);

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
      console.error('Erro ao buscar detalhes do exame:', error);
      throw error;
    }
  },

  async getAllExamsWithMaterials(): Promise<ExamDetails[]> {
    try {
      console.log('Buscando todos os exames com materiais...');

      // Buscar informações do usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw userError;
      }

      if (!user) {
        console.warn('Usuário não encontrado');
        return [];
      }

      // Buscar perfil do usuário para obter unit_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return [];
      }

      console.log('Perfil do usuário:', profile);

      // Buscar exames filtrados por unidade
      let query = supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      if (profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
        console.log('Filtrando por unidade:', profile.unit_id);
      }

      const { data: exams, error } = await query;

      if (error) {
        console.error('Erro ao buscar exames:', error);
        throw error;
      }

      console.log('Exames encontrados:', exams?.length || 0);

      if (!exams || exams.length === 0) {
        return [];
      }

      // Buscar detalhes de cada exame
      const examDetails = await Promise.allSettled(
        exams.map(async (exam) => {
          try {
            return await this.getExamDetails(exam.id);
          } catch (error) {
            console.error(`Erro ao buscar detalhes do exame ${exam.id}:`, error);
            // Retornar dados básicos se não conseguir buscar materiais
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
            } as ExamDetails;
          }
        })
      );

      const successfulResults = examDetails
        .filter((result): result is PromiseFulfilledResult<ExamDetails | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      console.log('Exames processados com sucesso:', successfulResults.length);
      return successfulResults;
    } catch (error) {
      console.error('Erro ao buscar todos os exames:', error);
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
      console.error('Erro ao validar materiais do exame:', error);
      throw error;
    }
  }
};
