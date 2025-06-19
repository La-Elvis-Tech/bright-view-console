
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

    // Previsão de demanda
    if (metrics.weeklyGrowth > 10) {
      insights.push({
        type: 'growth',
        title: 'Alta Demanda Prevista',
        description: `Com crescimento de ${metrics.weeklyGrowth}%, prepare-se para aumento de 20-30% nos próximos dias`,
        priority: 'high',
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40',
        borderColor: 'border-green-200 dark:border-green-800/50'
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
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/40 dark:to-orange-950/40',
        borderColor: 'border-red-200 dark:border-red-800/50'
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
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40',
        borderColor: 'border-blue-200 dark:border-blue-800/50'
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
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/40 dark:to-amber-950/40',
        borderColor: 'border-yellow-200 dark:border-yellow-800/50'
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
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Brain size={18} className="text-indigo-600 dark:text-indigo-400" />
          Insights Preditivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 ${insight.bgColor} rounded-xl border ${insight.borderColor} hover:shadow-sm transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/80 dark:bg-neutral-800/80 rounded-lg shadow-sm">
                    <insight.icon size={16} className={insight.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {insight.title}
                      </h4>
                      <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                        {insight.priority === 'critical' ? 'Crítico' : 
                         insight.priority === 'high' ? 'Alto' : 
                         insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum insight disponível</p>
              <p className="text-sm mt-1">Dados insuficientes para análise preditiva</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveInsights;
