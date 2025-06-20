
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
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'em andamento':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'concluído':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Calendar className="h-4 w-4 text-gray-400" />
          Últimos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {exams.length > 0 ? exams.map((exam) => (
            <div 
              key={exam.id}
              className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {exam.patient_name}
                  </h4>
                  <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </Badge>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(exam.created_at), 'HH:mm', { locale: ptBR })}
                  </div>
                  <div className="mt-1">
                    {format(new Date(exam.created_at), 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="font-medium">{exam.exam_type}</div>
                <div className="mt-1">Dr. {exam.doctor_name}</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-400">
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
