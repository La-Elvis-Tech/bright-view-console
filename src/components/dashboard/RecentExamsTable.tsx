
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
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'em andamento':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'concluído':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Calendar className="h-4 w-4 text-neutral-400" />
          Últimos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {exams.length > 0 ? exams.map((exam) => (
            <div 
              key={exam.id}
              className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {exam.patient_name}
                  </h4>
                  <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </Badge>
                </div>
                <div className="text-right text-xs text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(exam.created_at), 'HH:mm', { locale: ptBR })}
                  </div>
                  <div className="mt-1">
                    {format(new Date(exam.created_at), 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                <div className="font-medium">{exam.exam_type}</div>
                <div className="mt-1">Dr. {exam.doctor_name}</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-neutral-400">
              <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum agendamento recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExamsTable;
