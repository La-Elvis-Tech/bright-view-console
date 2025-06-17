
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

export interface ExamType {
  id: string;
  name: string;
  category?: string;
  description?: string;
  duration_minutes?: number;
  cost?: number;
  requires_preparation?: boolean;
  preparation_instructions?: string;
  unit_id?: string;
  active: boolean;
}

export const useExamTypes = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile, hasRole } = useAuthContext();

  const fetchExamTypes = async () => {
    try {
      let query = supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      // Se não é admin/supervisor, filtrar por unidade
      if (!hasRole('admin') && !hasRole('supervisor') && profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar e validar dados mais rigorosamente
      const validExamTypes = (data || [])
        .filter(examType => 
          examType && 
          examType.id && 
          typeof examType.id === 'string' && 
          examType.id.trim() !== '' &&
          examType.name && 
          typeof examType.name === 'string' && 
          examType.name.trim() !== ''
        )
        .map(examType => ({
          ...examType,
          id: examType.id.trim(),
          name: examType.name.trim(),
          category: examType.category?.trim() || undefined,
          description: examType.description?.trim() || undefined,
          preparation_instructions: examType.preparation_instructions?.trim() || undefined,
          duration_minutes: examType.duration_minutes || 30,
          cost: examType.cost ? Number(examType.cost) : undefined,
          requires_preparation: Boolean(examType.requires_preparation),
          active: Boolean(examType.active)
        }));

      console.log('Exam types loaded:', validExamTypes.length);
      setExamTypes(validExamTypes);
    } catch (error: any) {
      console.error('Error fetching exam types:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tipos de exames.',
        variant: 'destructive',
      });
      setExamTypes([]);
    }
  };

  useEffect(() => {
    const loadExamTypes = async () => {
      if (profile) {
        setLoading(true);
        await fetchExamTypes();
        setLoading(false);
      }
    };

    loadExamTypes();
  }, [profile?.unit_id, hasRole]);

  return {
    examTypes,
    loading,
    refreshExamTypes: fetchExamTypes,
  };
};
