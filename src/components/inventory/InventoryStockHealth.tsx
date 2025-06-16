
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, TrendingUp, Package } from "lucide-react";
import GaugeChart from "@/components/ui/GaugeChart";

interface InventoryStockHealthProps {
  items: any[];
  expiringItems: any[];
}

const InventoryStockHealth: React.FC<InventoryStockHealthProps> = ({ items, expiringItems }) => {
  // Calcular estatísticas
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.stock <= item.minStock);
  const overStockItems = items.filter(item => item.stock >= item.maxStock);
  const criticalItems = items.filter(item => item.status === "low");
  
  const lowStockPercentage = Math.round((lowStockItems.length / totalItems) * 100);
  const expiringPercentage = Math.round((expiringItems.length / totalItems) * 100);
  const healthScore = Math.max(0, 100 - lowStockPercentage - expiringPercentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Package size={16} />
            Saúde Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <GaugeChart 
            value={healthScore} 
            size={120} 
            strokeWidth={20} 
            title="Score"
            railColor="#e5e7eb"
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
            <TrendingDown size={16} />
            Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {lowStockItems.length}
              </span>
              <Badge variant="destructive" className="text-xs">
                {lowStockPercentage}%
              </Badge>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              itens abaixo do mínimo
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle size={16} />
            Vencendo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {expiringItems.length}
              </span>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
                30 dias
              </Badge>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              itens expirando em breve
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
            <TrendingUp size={16} />
            Excesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {overStockItems.length}
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                Acima max
              </Badge>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              itens em excesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStockHealth;
