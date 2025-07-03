
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target,
  Users
} from 'lucide-react';

interface PerformanceMetricsProps {
  selectedUnitId?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ selectedUnitId }) => {
  // Mock data - replace with real data fetching
  const metrics = {
    efficiency: 85,
    patientSatisfaction: 92,
    averageWaitTime: 15,
    examCompletionRate: 94,
    growthRate: 12.5,
    activePatients: 247
  };

  const performanceCards = [
    {
      title: "Eficiência Operacional",
      value: `${metrics.efficiency}%`,
      change: "+5.2%",
      trend: "up",
      icon: Target,
      progress: metrics.efficiency,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Satisfação do Paciente",
      value: `${metrics.patientSatisfaction}%`,
      change: "+2.1%",
      trend: "up",
      icon: Users,
      progress: metrics.patientSatisfaction,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Tempo Médio de Espera",
      value: `${metrics.averageWaitTime}min`,
      change: "-3.5min",
      trend: "down",
      icon: Clock,
      progress: 100 - (metrics.averageWaitTime * 2), // Inverted for wait time
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Taxa de Conclusão",
      value: `${metrics.examCompletionRate}%`,
      change: "+1.8%",
      trend: "up",
      icon: Activity,
      progress: metrics.examCompletionRate,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Métricas de Performance
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Indicadores de desempenho operacional e qualidade
        </p>
      </div>

      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                      {card.title}
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {card.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    card.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={card.progress} 
                  className="h-1.5"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {card.progress}% do objetivo
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            Insights de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Crescimento
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-600">+{metrics.growthRate}%</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                vs. mês anterior
              </p>
            </div>
            
            <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Pacientes Ativos
                </span>
              </div>
              <p className="text-lg font-bold text-blue-600">{metrics.activePatients}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                últimos 30 dias
              </p>
            </div>
            
            <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Meta Mensal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-purple-600">89%</p>
                <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  Atingida
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
