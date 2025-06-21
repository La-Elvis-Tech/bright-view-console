
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Calendar } from "lucide-react";
import { gsap } from "gsap";
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
}

const RecentExamsTable: React.FC = () => {
  const { profile } = useAuthContext();
  const tableRef = useRef<HTMLDivElement>(null);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['recent-exams-dashboard', profile?.unit_id],
    queryFn: async (): Promise<RecentExam[]> => {
      if (!profile?.unit_id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          status,
          created_at,
          exam_types(name),
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
        status: exam.status,
        created_at: exam.created_at,
        doctor_name: exam.doctors?.name || 'N/A'
      })) || [];
    },
    enabled: !!profile?.unit_id
  });

  useEffect(() => {
    if (!isLoading && tableRef.current && exams.length > 0) {
      const rows = tableRef.current.querySelectorAll('.exam-row');
      gsap.fromTo(rows, 
        { 
          opacity: 0, 
          x: -20
        },
        { 
          opacity: 1, 
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, exams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30';
      case 'Em andamento':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30';
      case 'Agendado':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
      case 'Cancelado':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Activity className="h-4 w-4" />
            Exames Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={tableRef} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Activity className="h-4 w-4" />
          Exames Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div 
                key={exam.id} 
                className="exam-row flex items-center justify-between p-3 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50 transition-all duration-200"
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
                  <Badge className={`text-xs px-2 py-1 border ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400">
            <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum exame encontrado</p>
            <p className="text-xs mt-1">para sua unidade</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExamsTable;
