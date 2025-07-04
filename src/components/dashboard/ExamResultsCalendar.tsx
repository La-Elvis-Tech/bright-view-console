
import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { gsap } from "gsap";

interface ExamResultData {
  day: string;
  value: number;
}

const ExamResultsCalendar: React.FC = () => {
  const { profile } = useAuthContext();
  const calendarRef = useRef<HTMLDivElement>(null);

  const { data: examData = [], isLoading } = useQuery({
    queryKey: ['exam-results-calendar', profile?.unit_id],
    queryFn: async (): Promise<ExamResultData[]> => {
      if (!profile?.unit_id) return [];

      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));
      const today = endOfMonth(new Date());

      console.log('Buscando dados do calendário para unidade:', profile.unit_id);
      console.log('Período:', format(twelveMonthsAgo, 'yyyy-MM-dd'), 'até', format(today, 'yyyy-MM-dd'));

      // Tentar buscar appointments concluídos primeiro (dados mais confiáveis)
      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('scheduled_date, status, unit_id')
        .eq('unit_id', profile.unit_id)
        .eq('status', 'Concluído')
        .gte('scheduled_date', format(twelveMonthsAgo, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(today, 'yyyy-MM-dd'));

      console.log('Appointments encontrados:', appointments?.length || 0);

      if (!appointmentError && appointments && appointments.length > 0) {
        const dateCount: Record<string, number> = {};
        appointments.forEach(appointment => {
          const date = format(new Date(appointment.scheduled_date), 'yyyy-MM-dd');
          dateCount[date] = (dateCount[date] || 0) + 1;
        });

        console.log('Dados processados do calendário:', Object.keys(dateCount).length, 'dias com exames');
        return Object.entries(dateCount).map(([day, value]) => ({
          day,
          value
        }));
      }

      // Fallback: buscar exam_results se appointments não funcionou
      const { data: examResults, error: examError } = await supabase
        .from('exam_results')
        .select('exam_date, result_status, unit_id')
        .eq('unit_id', profile.unit_id)
        .eq('result_status', 'Concluído')
        .gte('exam_date', format(twelveMonthsAgo, 'yyyy-MM-dd'))
        .lte('exam_date', format(today, 'yyyy-MM-dd'));

      console.log('Exam results encontrados:', examResults?.length || 0);

      if (!examError && examResults) {
        const dateCount: Record<string, number> = {};
        examResults.forEach(result => {
          const date = format(new Date(result.exam_date), 'yyyy-MM-dd');
          dateCount[date] = (dateCount[date] || 0) + 1;
        });

        return Object.entries(dateCount).map(([day, value]) => ({
          day,
          value
        }));
      }

      console.log('Nenhum dado encontrado para o calendário');
      return [];
    },
    enabled: !!profile?.unit_id
  });

  useEffect(() => {
    if (!isLoading && calendarRef.current && examData.length >= 0) {
      const squares = calendarRef.current.querySelectorAll('.calendar-square');
      gsap.fromTo(squares, 
        { 
          opacity: 0, 
          scale: 0
        },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.6,
          stagger: 0.005,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, examData]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Generate all days for the last 12 months
  const fromDate = startOfMonth(subMonths(new Date(), 11));
  const toDate = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start: fromDate, end: toDate });

  // Create data map for quick lookup
  const dataMap = examData.reduce((acc, item) => {
    acc[item.day] = item.value;
    return acc;
  }, {} as Record<string, number>);

  // Get intensity level (0-4) based on exam count
  const getIntensityLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };

  // Get color based on intensity
  const getColor = (level: number) => {
    const colors = [
      'bg-neutral-100 dark:bg-neutral-800/30', // 0 exams
      'bg-emerald-200 dark:bg-emerald-900/50', // 1-2 exams
      'bg-emerald-400 dark:bg-emerald-700/70', // 3-5 exams
      'bg-emerald-600 dark:bg-emerald-600/80', // 6-8 exams
      'bg-emerald-800 dark:bg-emerald-500/90', // 9+ exams
    ];
    return colors[level];
  };

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add empty days to align with Sunday start
  const firstDayOfWeek = getDay(allDays[0]);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)); // placeholder
  }

  allDays.forEach((day) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-base md:text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Exames Realizados
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="hidden sm:inline">Menos</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`w-2 h-2 rounded-sm ${getColor(level)}`} />
              ))}
            </div>
            <span className="hidden sm:inline">Mais</span>
          </div>
        </div>
        
        <div ref={calendarRef} className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1 min-w-max">
            {/* Month labels */}
            <div className="flex gap-1 ml-6 mb-2 text-xs text-neutral-500 dark:text-neutral-400">
              {Array.from({ length: 12 }).map((_, monthIndex) => (
                <div key={monthIndex} className="w-8 text-left">
                  {monthLabels[monthIndex]}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 w-6">
                {dayLabels.map((day, index) => (
                  <div key={index} className={`text-xs text-neutral-500 dark:text-neutral-400 h-2 flex items-center ${index % 2 === 1 ? 'opacity-0' : ''}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Weeks */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    if (day.getTime() === 0) {
                      return <div key={dayIndex} className="w-2 h-2" />;
                    }
                    
                    const dateString = format(day, 'yyyy-MM-dd');
                    const examCount = dataMap[dateString] || 0;
                    const level = getIntensityLevel(examCount);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`calendar-square w-2 h-2 rounded-sm cursor-pointer hover:ring-1 hover:ring-neutral-400 dark:hover:ring-neutral-500 transition-all duration-200 ${getColor(level)}`}
                        title={`${format(day, 'dd/MM/yyyy', { locale: ptBR })}: ${examCount} exame${examCount !== 1 ? 's' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExamResultsCalendar;
