
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity } from "lucide-react";
import { gsap } from "gsap";

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
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(tableRef.current, 
        { 
          opacity: 0, 
          y: 20,
          scale: 0.98
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    }
  }, [exams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Agendado':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300';
    }
  };

  return (
    <Card ref={tableRef} className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Activity className="h-4 w-4" />
          Exames Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exams.slice(0, 6).map((exam) => (
            <div 
              key={exam.id} 
              className="flex items-center justify-between p-3 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {exam.patient_name}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {exam.exam_type} • Dr. {exam.doctor_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {format(new Date(exam.created_at), 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
                <Badge className={`text-xs px-2 py-1 ${getStatusColor(exam.status)}`}>
                  {exam.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExamsTable;
