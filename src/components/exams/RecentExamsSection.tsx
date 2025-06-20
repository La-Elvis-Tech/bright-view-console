
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

interface RecentExam {
  id: string;
  patient_name: string;
  exam_type: string;
  status: string;
  created_at: string;
  doctor_name: string;
  exam_category: string;
}

const RecentExamsSection: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: recentExams, isLoading } = useQuery({
    queryKey: ['recent-exams-page', profile?.unit_id],
    queryFn: async (): Promise<RecentExam[]> => {
      if (!profile?.unit_id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          status,
          created_at,
          exam_types(name, category),
          doctors(name)
        `)
        .eq('unit_id', profile.unit_id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      return data?.map(exam => ({
        id: exam.id,
        patient_name: exam.patient_name,
        exam_type: exam.exam_types?.name || 'N/A',
        exam_category: exam.exam_types?.category || 'N/A',
        status: exam.status,
        created_at: exam.created_at,
        doctor_name: exam.doctors?.name || 'N/A'
      })) || [];
    },
    enabled: !!profile?.unit_id
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'concluído':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/50 dark:bg-neutral-950/30 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Últimos Exames Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-neutral-950/30 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Últimos Exames Realizados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentExams?.length > 0 ? (
            recentExams.map((exam) => (
              <div 
                key={exam.id}
                className="p-4 bg-white dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {exam.patient_name}
                      </h4>
                      <Badge className={`text-xs ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <FileText className="h-3 w-3" />
                      <span>{exam.exam_type}</span>
                      <span className="text-neutral-400">•</span>
                      <span>{exam.exam_category}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {format(new Date(exam.created_at), 'HH:mm', { locale: ptBR })}
                    </div>
                    <div className="mt-1">
                      {format(new Date(exam.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Dr. {exam.doctor_name}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exame recente encontrado</p>
              <p className="text-sm mt-1">para sua unidade</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExamsSection;
