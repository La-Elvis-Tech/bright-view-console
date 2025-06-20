
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
  result_status: string;
  exam_date: string;
  doctor_name: string;
  exam_category: string;
}

const RecentExamsSection: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: recentExams, isLoading } = useQuery({
    queryKey: ['recent-exam-results', profile?.unit_id],
    queryFn: async (): Promise<RecentExam[]> => {
      if (!profile?.unit_id) return [];

      const { data, error } = await supabase
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
        .limit(6);

      if (error) throw error;

      return data?.map(exam => ({
        id: exam.id,
        patient_name: exam.patient_name,
        exam_type: exam.exam_types?.name || 'N/A',
        exam_category: exam.exam_category || 'N/A',
        result_status: exam.result_status,
        exam_date: exam.exam_date,
        doctor_name: exam.doctors?.name || 'N/A'
      })) || [];
    },
    enabled: !!profile?.unit_id
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'em análise':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'concluído':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Calendar className="h-4 w-4 text-gray-400" />
            Últimos Exames Realizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Calendar className="h-4 w-4 text-gray-400" />
          Últimos Exames Realizados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentExams?.length > 0 ? (
          recentExams.map((exam) => (
            <div 
              key={exam.id}
              className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-900">
                      {exam.patient_name}
                    </h4>
                    <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(exam.result_status)}`}>
                      {exam.result_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>{exam.exam_type}</span>
                    <span>•</span>
                    <span>{exam.exam_category}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(exam.exam_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Dr. {exam.doctor_name}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum exame realizado</p>
            <p className="text-xs mt-1">para sua unidade</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExamsSection;
