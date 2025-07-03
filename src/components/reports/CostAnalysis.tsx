
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  PieChart,
  Calculator,
  Target
} from 'lucide-react';

interface CostAnalysisProps {
  selectedUnitId?: string;
}

const CostAnalysis: React.FC<CostAnalysisProps> = ({ selectedUnitId }) => {
  // Mock data - replace with real data fetching
  const costData = {
    totalCosts: 125000,
    monthlyChange: -8.5,
    costPerExam: 85,
    efficiency: 92,
    categories: [
      { name: "Materiais", value: 45000, percentage: 36, color: "bg-blue-500" },
      { name: "Pessoal", value: 50000, percentage: 40, color: "bg-emerald-500" },
      { name: "Equipamentos", value: 20000, percentage: 16, color: "bg-purple-500" },
      { name: "Outros", value: 10000, percentage: 8, color: "bg-orange-500" }
    ]
  };

  const costMetrics = [
    {
      title: "Custo Total Mensal",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(costData.totalCosts),
      change: `${costData.monthlyChange}%`,
      trend: costData.monthlyChange < 0 ? "down" : "up",
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Custo por Exame",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(costData.costPerExam),
      change: "-2.1%",
      trend: "down",
      icon: Calculator,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Eficiência de Custos",
      value: `${costData.efficiency}%`,
      change: "+5.3%",
      trend: "up",
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Análise de Custos
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Breakdown detalhado de gastos e eficiência financeira
        </p>
      </div>

      {/* Cost Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {costMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    {metric.title}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    metric.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-neutral-500" />
              Distribuição de Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {costData.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(category.value)}
                    </span>
                    <Badge className="ml-2 text-xs bg-neutral-100 text-neutral-700 border-neutral-200">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost Trends */}
        <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Tendências de Custo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Redução de Custos
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Economia de R$ 12.500 este mês através de otimizações
              </p>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Meta de Eficiência
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                92% da meta mensal de eficiência alcançada
              </p>
            </div>

            <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Projeção Próximo Mês
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Estimativa de R$ 118.000 baseada nas tendências atuais
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysis;
