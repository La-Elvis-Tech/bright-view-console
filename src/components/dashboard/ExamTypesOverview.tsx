
import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, FlaskConical } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

interface ExamTypeOverview {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  cost: number;
  appointment_count: number;
}

const ExamTypesOverview: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: examTypes, isLoading } = useQuery({
    queryKey: ['exam-types-overview', profile?.unit_id],
    queryFn: async (): Promise<ExamTypeOverview[]> => {
      let examsQuery = supabase
        .from('exam_types')
        .select('id, name, category, duration_minutes, cost')
        .eq('active', true)
        .order('name')
        .limit(5);

      // Filtrar por unidade do usuário
      if (profile?.unit_id) {
        examsQuery = examsQuery.eq('unit_id', profile.unit_id);
      }

      const { data: exams, error: examsError } = await examsQuery;

      if (examsError) throw examsError;

      // Buscar contagem de agendamentos por tipo
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('exam_type_id, status')
        .in('exam_type_id', exams?.map(e => e.id) || []);

      if (appointmentsError) throw appointmentsError;

      return exams?.map(exam => {
        const appointmentCount = appointments?.filter(app => 
          app.exam_type_id === exam.id && app.status !== 'Cancelado'
        ).length || 0;

        return {
          ...exam,
          appointment_count: appointmentCount
        };
      }) || [];
    },
    enabled: !!profile
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Tipos de Exames
          </h2>
          <Link
            to="/requests"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
          >
            Ver Todos
          </Link>
        </div>
        <div className="space-y-3">
          {examTypes?.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exame encontrado</p>
              <p className="text-sm">para sua unidade</p>
            </div>
          ) : (
            examTypes?.map((exam) => (
              <div key={exam.id} className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                      {exam.name}
                    </h3>
                    <Badge variant="outline" className="mt-1 text-xs border-neutral-300 dark:border-neutral-600">
                      {exam.category}
                    </Badge>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {exam.appointment_count}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">agendamentos</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exam.duration_minutes}min
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    R$ {exam.cost?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default ExamTypesOverview;
