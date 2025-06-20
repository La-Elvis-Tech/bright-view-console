import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, Zap, Brain } from "lucide-react";

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

    if (metrics.weeklyGrowth > 10) {
      insights.push({
        type: 'growth',
        title: 'Alta Demanda Prevista',
        description: `Com crescimento de ${metrics.weeklyGrowth}%, prepare-se para aumento de 20-30% nos próximos dias`,
        priority: 'high',
        icon: TrendingUp,
        color: 'text-neutral-600 dark:text-neutral-400'
      });
    }

    if (metrics.criticalStock > 0) {
      insights.push({
        type: 'stock',
        title: 'Reposição Urgente',
        description: `${metrics.criticalStock} itens críticos podem afetar ${Math.round(metrics.criticalStock * 2.5)} exames`,
        priority: 'critical',
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400'
      });
    }

    if (metrics.totalExams > 50) {
      insights.push({
        type: 'efficiency',
        title: 'Oportunidade de Otimização',
        description: 'Alta demanda detectada. Considere agenda adicional para reduzir tempo de espera',
        priority: 'medium',
        icon: Target,
        color: 'text-neutral-600 dark:text-neutral-400'
      });
    }

    if (metrics.expiringSoon > 0) {
      insights.push({
        type: 'expiry',
        title: 'Planejamento de Uso',
        description: `${metrics.expiringSoon} itens vencem em 30 dias. Priorize seu uso nos próximos exames`,
        priority: 'medium',
        icon: Zap,
        color: 'text-neutral-600 dark:text-neutral-400'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'high':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'medium':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Brain className="h-4 w-4 text-neutral-400" />
          Insights Preditivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index}
                className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded">
                    <insight.icon className={`h-3 w-3 ${insight.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {insight.title}
                      </h4>
                      <Badge className={`text-xs px-2 py-0.5 border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority === 'critical' ? 'Crítico' : 
                         insight.priority === 'high' ? 'Alto' : 
                         insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <Brain className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhum insight disponível</p>
              <p className="text-xs mt-1">Dados insuficientes para análise preditiva</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveInsights;
