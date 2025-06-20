
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
        color: 'text-green-600'
      });
    }

    if (metrics.criticalStock > 0) {
      insights.push({
        type: 'stock',
        title: 'Reposição Urgente',
        description: `${metrics.criticalStock} itens críticos podem afetar ${Math.round(metrics.criticalStock * 2.5)} exames`,
        priority: 'critical',
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    }

    if (metrics.totalExams > 50) {
      insights.push({
        type: 'efficiency',
        title: 'Oportunidade de Otimização',
        description: 'Alta demanda detectada. Considere agenda adicional para reduzir tempo de espera',
        priority: 'medium',
        icon: Target,
        color: 'text-blue-600'
      });
    }

    if (metrics.expiringSoon > 0) {
      insights.push({
        type: 'expiry',
        title: 'Planejamento de Uso',
        description: `${metrics.expiringSoon} itens vencem em 30 dias. Priorize seu uso nos próximos exames`,
        priority: 'medium',
        icon: Zap,
        color: 'text-yellow-600'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Brain className="h-4 w-4 text-gray-400" />
          Insights Preditivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index}
                className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-50 rounded">
                    <insight.icon className={`h-3 w-3 ${insight.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {insight.title}
                      </h4>
                      <Badge className={`text-xs px-2 py-0.5 border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority === 'critical' ? 'Crítico' : 
                         insight.priority === 'high' ? 'Alto' : 
                         insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
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
