
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';

interface InventoryStatsProps {
  items: InventoryItem[];
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ items }) => {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.cost_per_unit || 0)), 0);
  const lowStockItems = items.filter(item => item.current_stock <= item.min_stock).length;
  const outOfStockItems = items.filter(item => item.current_stock === 0).length;

  const stats = [
    {
      title: 'Total de Itens',
      value: totalItems.toString(),
      icon: Package,
      color: 'text-lab-blue',
      bgColor: 'bg-lab-lightBlue',
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalValue),
      icon: TrendingUp,
      color: 'text-lab-green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Estoque Baixo',
      value: lowStockItems.toString(),
      icon: TrendingDown,
      color: 'text-lab-yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Sem Estoque',
      value: outOfStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-lab-red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InventoryStats;
