
import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamTrend {
  date: string;
  count: number;
  revenue: number;
}

interface ExamTrendsChartProps {
  data: ExamTrend[];
}

const ExamTrendsChart: React.FC<ExamTrendsChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    day: format(new Date(item.date), 'dd/MM', { locale: ptBR })
  }));

  return (
    <Card className="p-6 border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Tendência de Exames
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Últimos 7 dias
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                name === 'count' ? `${value} exames` : `R$ ${Number(value).toFixed(2)}`,
                name === 'count' ? 'Exames' : 'Receita'
              ]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ExamTrendsChart;
