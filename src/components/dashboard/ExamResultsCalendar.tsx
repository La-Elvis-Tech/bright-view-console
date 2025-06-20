import React from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface ExamResultData {
  day: string;
  value: number;
}

const ExamResultsCalendar: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: examData = [], isLoading } = useQuery({
    queryKey: ['exam-results-calendar', profile?.unit_id],
    queryFn: async (): Promise<ExamResultData[]> => {
      // Buscar dados dos últimos 12 meses para melhor visualização
      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));
      const today = endOfMonth(new Date());

      const { data: examResults, error } = await supabase
        .from('exam_results')
        .select('exam_date, result_status')
        .eq('unit_id', profile?.unit_id)
        .gte('exam_date', format(twelveMonthsAgo, 'yyyy-MM-dd'))
        .lte('exam_date', format(today, 'yyyy-MM-dd'));

      if (error) throw error;

      // Agrupar por data e contar
      const dateCount: Record<string, number> = {};
      examResults?.forEach(result => {
        const date = result.exam_date;
        dateCount[date] = (dateCount[date] || 0) + 1;
      });

      // Converter para formato do nivo
      return Object.entries(dateCount).map(([day, value]) => ({
        day,
        value
      }));
    },
    enabled: !!profile?.unit_id
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 dark:border-neutral-400 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  const fromDate = format(startOfMonth(subMonths(new Date(), 11)), 'yyyy-MM-dd');
  const toDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-medium text-neutral-900 dark:text-neutral-100">
            Calendário de Exames Realizados
          </h2>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Últimos 12 meses
          </div>
        </div>
        
        <div className="h-[320px] w-full">
          <ResponsiveCalendar
            data={examData}
            from={fromDate}
            to={toDate}
            emptyColor="#f5f5f5"
            colors={['#e5e5e5', '#a3a3a3', '#737373', '#525252', '#262626']}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            yearSpacing={40}
            monthBorderWidth={1}
            monthBorderColor="#e5e7eb"
            dayBorderWidth={0}
            dayBorderColor="transparent"
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: 'right-to-left'
              }
            ]}
            tooltip={({ day, value, color }) => (
              <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {format(new Date(day), 'dd/MM/yyyy')}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {value} exame{Number(value) !== 1 ? 's' : ''} realizado{Number(value) !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
                fill: '#6b7280',
                outlineWidth: 0,
                outlineColor: 'transparent'
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default ExamResultsCalendar;
