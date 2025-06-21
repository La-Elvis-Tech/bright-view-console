
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

interface ExamTrend {
  date: string;
  count: number;
  revenue: number;
}

interface ExamTrendsChartProps {
  data?: ExamTrend[];
}

const ExamTrendsChart: React.FC<ExamTrendsChartProps> = ({ data: propData }) => {
  const { profile } = useAuthContext();
  const chartRef = useRef<HTMLDivElement>(null);

  // Buscar dados reais se não foram fornecidos via props
  const { data: examTrends = [], isLoading } = useQuery({
    queryKey: ['exam-trends', profile?.unit_id],
    queryFn: async (): Promise<ExamTrend[]> => {
      if (!profile?.unit_id) return [];

      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('scheduled_date, cost, status')
        .eq('unit_id', profile.unit_id)
        .gte('scheduled_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Agrupar por data
      const dateGroups: Record<string, { count: number; revenue: number }> = {};
      
      appointments?.forEach(appointment => {
        const date = format(new Date(appointment.scheduled_date), 'yyyy-MM-dd');
        if (!dateGroups[date]) {
          dateGroups[date] = { count: 0, revenue: 0 };
        }
        dateGroups[date].count += 1;
        if (appointment.status === 'Concluído' && appointment.cost) {
          dateGroups[date].revenue += appointment.cost;
        }
      });

      // Converter para array e ordenar
      return Object.entries(dateGroups)
        .map(([date, data]) => ({
          date,
          count: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Últimos 14 dias
    },
    enabled: !!profile?.unit_id && !propData
  });

  const data = propData || examTrends;

  const formattedData = data.map(item => ({
    ...item,
    day: format(new Date(item.date), 'dd/MM', { locale: ptBR })
  }));

  const totalExams = data.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  useEffect(() => {
    if (chartRef.current && !isLoading && data.length > 0) {
      gsap.fromTo(chartRef.current, 
        { 
          opacity: 0, 
          y: 30,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        }
      );
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Tendência de Exames
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Tendência de Exames
          </span>
          <div className="text-right text-xs">
            <div className="text-neutral-900 dark:text-neutral-100 font-medium">
              {totalExams} exames
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: -10, left: -40, bottom: 0 }}>
                <defs>
                  <linearGradient id="examGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  hide 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  hide
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value, name) => [
                    name === 'count' ? `${value} exames` : `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'count' ? 'Exames Realizados' : 'Receita Gerada'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#examGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum dado disponível</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamTrendsChart;
