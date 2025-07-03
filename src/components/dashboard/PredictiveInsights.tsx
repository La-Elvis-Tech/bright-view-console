
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, Zap, Brain } from "lucide-react";
import { gsap } from "gsap";

interface PredictiveInsightsProps {
  metrics: {
    totalExams: number;
    weeklyGrowth: number;
    criticalStock: number;
    expiringSoon: number;
  };
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ metrics }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      const insights = cardRef.current.querySelectorAll('.insight-item');
      gsap.fromTo(insights, 
        { 
          opacity: 0, 
          y: 10
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }
  }, [metrics]);

  const generateInsights = () => {
    const insights = [];

    if (metrics.weeklyGrowth > 10) {
      insights.push({
        type: 'growth',
        title: 'Alta Demanda',
        description: `Crescimento de ${metrics.weeklyGrowth}%. Prepare-se para aumento de 20-30%`,
        priority: 'high',
        icon: TrendingUp,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20'
      });
    }

    if (metrics.criticalStock > 0) {
      insights.push({
        type: 'stock',
        title: 'Estoque Crítico',
        description: `${metrics.criticalStock} itens podem afetar ${Math.round(metrics.criticalStock * 2.5)} exames`,
        priority: 'critical',
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20'
      });
    }

    if (metrics.totalExams > 50) {
      insights.push({
        type: 'efficiency',
        title: 'Otimização',
        description: 'Considere agenda adicional para reduzir tempo de espera',
        priority: 'medium',
        icon: Target,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20'
      });
    }

    if (metrics.expiringSoon > 0) {
      insights.push({
        type: 'expiry',
        title: 'Itens Vencendo',
        description: `${metrics.expiringSoon} itens vencem em 30 dias`,
        priority: 'medium',
        icon: Zap,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
      case 'high':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800/40 dark:text-neutral-300 dark:border-neutral-700';
    }
  };

  return (
    <Card ref={cardRef} className="h-full border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="p-1 bg-neutral-50 dark:bg-neutral-800/40 rounded">
            <Brain className="h-3 w-3 text-neutral-500" />
          </div>
          Insights Preditivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index}
                className="insight-item p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors bg-neutral-50/50 dark:bg-neutral-800/20"
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1 rounded ${insight.bgColor}`}>
                    <insight.icon className={`h-3 w-3 ${insight.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {insight.title}
                      </h4>
                      <Badge className={`text-xs px-1.5 py-0.5 border ${getPriorityColor(insight.priority)}`}>
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
            <div className="text-center py-6">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg w-fit mx-auto mb-2">
                <Brain className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Nenhum insight</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveInsights;
