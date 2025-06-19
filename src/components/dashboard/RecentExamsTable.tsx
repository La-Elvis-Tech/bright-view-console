
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    <Card className="p-6 border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Últimos Exames
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Atividade recente
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {exam.patient_name}
                </p>
                <Badge className={`text-xs ${getStatusColor(exam.status)}`}>
                  {exam.status}
                </Badge>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {exam.exam_type} • Dr. {exam.doctor_name}
              </p>
            </div>
            <div className="text-right ml-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {format(new Date(exam.created_at), 'dd/MM', { locale: ptBR })}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {format(new Date(exam.created_at), 'HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentExamsTable;
