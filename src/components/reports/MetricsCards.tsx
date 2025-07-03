
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Users
} from 'lucide-react';

interface MetricsCardsProps {
  appointmentMetrics: {
    total: number;
    thisMonth: number;
    completed: number;
    revenue: number;
  };
  inventoryMetrics: {
    totalItems: number;
    lowStock: number;
    expiringSoon: number;
    totalValue: number;
  };
  alertsCount: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  appointmentMetrics,
  inventoryMetrics,
  alertsCount
}) => {
  const cards = [
    {
      title: "Agendamentos Totais",
      value: appointmentMetrics.total.toLocaleString(),
      change: `${appointmentMetrics.thisMonth} este mês`,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Receita Total",
      value: `R$ ${appointmentMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${appointmentMetrics.completed} concluídos`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    {
      title: "Itens no Inventário",
      value: inventoryMetrics.totalItems.toLocaleString(),
      change: `R$ ${inventoryMetrics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em estoque`,
      icon: Package,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      title: "Alertas Ativos",
      value: alertsCount.toString(),
      change: `${inventoryMetrics.lowStock} estoque baixo`,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {card.change}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
