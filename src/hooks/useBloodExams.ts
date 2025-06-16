
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BloodExamType, BloodExamPanel, BloodVolumeCalculation, DetailedMaterialValidation } from '@/types/bloodExam';
import { useToast } from '@/hooks/use-toast';

export const useBloodExams = () => {
  const [bloodExamTypes, setBloodExamTypes] = useState<BloodExamType[]>([]);
  const [bloodExamPanels, setBloodExamPanels] = useState<BloodExamPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBloodExamTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_exam_types')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our type
      const transformedData: BloodExamType[] = (data || []).map(item => ({
        ...item,
        reference_values: item.reference_values as Record<string, string> | null
      }));
      
      setBloodExamTypes(transformedData);
    } catch (error: any) {
      console.error('Error fetching blood exam types:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tipos de exames de sangue.',
        variant: 'destructive',
      });
    }
  };

  const fetchBloodExamPanels = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_exam_panels')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setBloodExamPanels(data || []);
    } catch (error: any) {
      console.error('Error fetching blood exam panels:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os painéis de exames.',
        variant: 'destructive',
      });
    }
  };

  const calculateBloodVolume = async (examIds: string[]): Promise<BloodVolumeCalculation | null> => {
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
    } catch (error: any) {
      console.error('Error calculating blood volume:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível calcular o volume de sangue necessário.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const calculateDetailedMaterials = async (
    examTypeId: string, 
    bloodExamIds: string[] = []
  ): Promise<DetailedMaterialValidation[]> => {
    try {
      const { data, error } = await supabase.rpc('calculate_detailed_exam_materials', {
        p_exam_type_id: examTypeId,
        p_blood_exams: bloodExamIds
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error calculating detailed materials:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível calcular os materiais necessários.',
        variant: 'destructive',
      });
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBloodExamTypes(),
        fetchBloodExamPanels()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    bloodExamTypes,
    bloodExamPanels,
    loading,
    calculateBloodVolume,
    calculateDetailedMaterials,
    refreshBloodExamTypes: fetchBloodExamTypes,
    refreshBloodExamPanels: fetchBloodExamPanels,
  };
};
