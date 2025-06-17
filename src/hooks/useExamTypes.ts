
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

export interface ExamType {
  id: string;
  name: string;
  category: string;
  description?: string;
  duration_minutes: number;
  cost?: number;
  requires_preparation: boolean;
  preparation_instructions?: string;
  unit_id?: string;
}

export const useExamTypes = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthContext();

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      // Filtrar por unidade do usuário se disponível
      if (profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter out exam types with empty or invalid IDs
      const validExamTypes = (data || []).filter(examType => 
        examType.id && 
        typeof examType.id === 'string' && 
        examType.id.trim() !== ''
      );

      console.log('Fetched exam types:', validExamTypes.length, 'for unit:', profile?.unit_id);
      setExamTypes(validExamTypes);
    } catch (error: any) {
      console.error('Error fetching exam types:', error);
      setExamTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchExamTypes();
    }
  }, [profile?.unit_id]);

  return {
    examTypes,
    loading,
    refreshExamTypes: fetchExamTypes,
  };
};
