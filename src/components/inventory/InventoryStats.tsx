
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      title: "Total de Itens",
      value: totalItems.toString(),
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: "Valor Total",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalValue),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: "Estoque Baixo",
      value: lowStockItems.toString(),
      icon: TrendingDown,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: "Sem Estoque",
      value: outOfStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardContent className="p-3 lg:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group p-3 lg:p-4 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all duration-200"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStats;
