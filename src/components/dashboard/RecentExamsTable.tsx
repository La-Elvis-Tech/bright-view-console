
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface RecentExam {
  id: string;
  patient_name: string;
  exam_type: string;
  status: string;
  created_at: string;
  doctor_name: string;
}

interface RecentExamsTableProps {
  exams: RecentExam[];
}

const RecentExamsTable: React.FC<RecentExamsTableProps> = ({ exams }) => {
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

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
          Últimos Exames
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {exams.length > 0 ? exams.map((exam) => (
            <div 
              key={exam.id}
              className="p-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/50 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {exam.patient_name}
                  </h4>
                  <Badge className={`text-xs ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </Badge>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(exam.created_at), 'HH:mm', { locale: ptBR })}
                  </div>
                  <div className="mt-1">
                    {format(new Date(exam.created_at), 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">{exam.exam_type}</div>
                <div className="text-xs mt-1">Dr. {exam.doctor_name}</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exame recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExamsTable;
