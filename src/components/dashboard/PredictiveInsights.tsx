
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";

interface PredictiveInsightsProps {
  metrics: {
    totalExams: number;
    weeklyGrowth: number;
    criticalStock: number;
    expiringSoon: number;
  };
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ metrics }) => {
  const generateInsights = () => {
    const insights = [];

    // Previsão de demanda
    if (metrics.weeklyGrowth > 10) {
      insights.push({
        type: 'growth',
        title: 'Alta Demanda Prevista',
        description: `Com crescimento de ${metrics.weeklyGrowth}%, prepare-se para aumento de 20-30% nos próximos dias`,
        priority: 'high',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/20'
      });
    }

    // Alerta de estoque
    if (metrics.criticalStock > 0) {
      insights.push({
        type: 'stock',
        title: 'Reposição Urgente',
        description: `${metrics.criticalStock} itens críticos podem afetar ${Math.round(metrics.criticalStock * 2.5)} exames`,
        priority: 'critical',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/20'
      });
    }

    // Otimização
    if (metrics.totalExams > 50) {
      insights.push({
        type: 'efficiency',
        title: 'Oportunidade de Otimização',
        description: 'Alta demanda detectada. Considere agenda adicional para reduzir tempo de espera',
        priority: 'medium',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20'
      });
    }

    // Previsão de vencimento
    if (metrics.expiringSoon > 0) {
      insights.push({
        type: 'expiry',
        title: 'Planejamento de Uso',
        description: `${metrics.expiringSoon} itens vencem em 30 dias. Priorize seu uso nos próximos exames`,
        priority: 'medium',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6 border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Insights Preditivos
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Análises e previsões inteligentes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
            >
              <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                <insight.icon size={18} className={insight.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {insight.title}
                  </h4>
                  <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                    {insight.priority === 'critical' ? 'Crítico' : 
                     insight.priority === 'high' ? 'Alto' : 
                     insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {insight.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum insight disponível</p>
            <p className="text-sm">Dados insuficientes para análise preditiva</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PredictiveInsights;
