
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, FileText, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

interface RecentExam {
  id: string;
  patient_name: string;
  exam_type: string;
  result_status: string;
  exam_date: string;
  doctor_name: string;
  exam_category: string;
}

const RecentExamsSection: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: recentExams, isLoading, error } = useQuery({
    queryKey: ['recent-exam-results', profile?.unit_id],
    queryFn: async (): Promise<RecentExam[]> => {
      if (!profile?.unit_id) return [];

      console.log('Buscando exames recentes para unidade:', profile.unit_id);

      // Primeiro, tentar buscar da tabela exam_results
      const { data: examResults, error: examError } = await supabase
        .from('exam_results')
        .select(`
          id,
          patient_name,
          result_status,
          exam_date,
          exam_category,
          exam_types(name),
          doctors(name)
        `)
        .eq('unit_id', profile.unit_id)
        .order('exam_date', { ascending: false })
        .limit(8);

      if (examError) {
        console.error('Erro ao buscar exam_results:', examError);
      }

      // Se temos dados de exam_results, usar eles
      if (examResults && examResults.length > 0) {
        console.log('Encontrados', examResults.length, 'resultados de exames');
        return examResults.map(exam => ({
          id: exam.id,
          patient_name: exam.patient_name,
          exam_type: exam.exam_types?.name || 'N/A',
          exam_category: exam.exam_category || 'N/A',
          result_status: exam.result_status,
          exam_date: exam.exam_date,
          doctor_name: exam.doctors?.name || 'N/A'
        }));
      }

      // Fallback: buscar appointments concluídos
      console.log('Fallback: buscando appointments concluídos');
      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          status,
          scheduled_date,
          exam_types(name, category),
          doctors(name)
        `)
        .eq('unit_id', profile.unit_id)
        .in('status', ['Concluído', 'Em andamento'])
        .order('scheduled_date', { ascending: false })
        .limit(8);

      if (appointmentError) {
        console.error('Erro ao buscar appointments:', appointmentError);
        return [];
      }

      console.log('Encontrados', appointments?.length || 0, 'appointments');
      return appointments?.map(appointment => ({
        id: appointment.id,
        patient_name: appointment.patient_name,
        exam_type: appointment.exam_types?.name || 'N/A',
        exam_category: appointment.exam_types?.category || 'N/A',
        result_status: appointment.status,
        exam_date: appointment.scheduled_date,
        doctor_name: appointment.doctors?.name || 'N/A'
      })) || [];
    },
    enabled: !!profile?.unit_id,
    retry: 1,
    retryDelay: 1000
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'em análise':
      case 'em andamento':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800';
      case 'concluído':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-300 dark:border-neutral-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <Activity className="h-4 w-4 text-neutral-400" />
            Últimos Exames Realizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Erro ao carregar exames:', error);
  }

  return (
    <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Activity className="h-4 w-4 text-neutral-400" />
          Últimos Exames Realizados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentExams && recentExams.length > 0 ? (
          recentExams.map((exam) => (
            <div 
              key={exam.id}
              className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors bg-neutral-50/30 dark:bg-neutral-800/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-neutral-400" />
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {exam.patient_name}
                    </h4>
                    <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(exam.result_status)}`}>
                      {exam.result_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <FileText className="h-3 w-3" />
                    <span>{exam.exam_type}</span>
                    <span>•</span>
                    <span>{exam.exam_category}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-400">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(exam.exam_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Dr. {exam.doctor_name}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-neutral-400">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum exame realizado</p>
            <p className="text-xs mt-1">para sua unidade</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExamsSection;
