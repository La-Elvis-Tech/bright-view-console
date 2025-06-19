
import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, Package } from "lucide-react";

interface MetricsGridProps {
  metrics: {
    totalExams: number;
    todayExams: number;
    weeklyGrowth: number;
    criticalStock: number;
    expiringSoon: number;
    averageExamTime: number;
  };
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Exames Hoje",
      value: metrics.todayExams,
      subtitle: `${metrics.totalExams} esta semana`,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Crescimento",
      value: `${metrics.weeklyGrowth > 0 ? '+' : ''}${metrics.weeklyGrowth}%`,
      subtitle: "vs. semana anterior",
      icon: metrics.weeklyGrowth >= 0 ? TrendingUp : TrendingDown,
      color: metrics.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500",
      bgColor: metrics.weeklyGrowth >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
    },
    {
      title: "Tempo Médio",
      value: `${metrics.averageExamTime}min`,
      subtitle: "por exame",
      icon: Clock,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Estoque Crítico",
      value: metrics.criticalStock,
      subtitle: `${metrics.expiringSoon} expirando`,
      icon: metrics.criticalStock > 0 ? AlertTriangle : Package,
      color: metrics.criticalStock > 0 ? "text-orange-500" : "text-gray-500",
      bgColor: metrics.criticalStock > 0 ? "bg-orange-50 dark:bg-orange-950/20" : "bg-gray-50 dark:bg-gray-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-4 border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                {card.title}
              </p>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {card.value}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {card.subtitle}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;
