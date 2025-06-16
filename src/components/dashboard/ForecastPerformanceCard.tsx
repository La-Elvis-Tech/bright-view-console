
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Target } from "lucide-react";

const ForecastPerformanceCard: React.FC = () => {
  const mapeScore = 12.3; // Mean Absolute Percentage Error
  
  const performanceData = [
    { month: "Jan", real: 200, predicted: 175 },
    { month: "Fev", real: 305, predicted: 190 },
    { month: "Mar", real: 220, predicted: 145 },
    { month: "Abr", real: 135, predicted: 195 },
    { month: "Mai", real: 250, predicted: 215 },
    { month: "Jun", real: 295, predicted: 225 }
  ];

  const getPerformanceLevel = (mape: number) => {
    if (mape <= 10) return { level: "Excelente", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (mape <= 20) return { level: "Bom", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (mape <= 30) return { level: "Regular", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { level: "Ruim", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  const performance = getPerformanceLevel(mapeScore);

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg ">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
          Performance de Previsão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 my-2 bg-gray-100/40 dark:bg-neutral-800/60 rounded-xl border border-gray-200 dark:border-neutral-900 shadow-sm">
            <div>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {mapeScore}%
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erro médio (MAPE)
              </p>
            </div>
            <Badge className={performance.color}>
              {performance.level}
            </Badge>
          </div>

          <div className="h-24 px-3 ">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b6a9a9" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(31 41 55)',
                    borderColor: 'rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'rgb(243 244 246)',
                    fontSize: '11px',
                    padding: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="real"
                  stroke="#7b76e7"
                  fill="url(#realGradient)"
                  strokeWidth={2}
                  dot={false}
                  name="Real"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#796f6f"
                  fill="url(#predictedGradient)"
                  strokeWidth={3}
                  strokeDasharray="7 5"
                  dot={false}
                  name="Previsto"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
            Real vs Previsto (últimos 6 meses)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastPerformanceCard;
