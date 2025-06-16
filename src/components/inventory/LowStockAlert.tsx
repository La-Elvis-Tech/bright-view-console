
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';

interface LowStockAlertProps {
  lowStockItems: InventoryItem[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ lowStockItems }) => {
  if (lowStockItems.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
      <CardContent className="flex items-center gap-3 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Atenção: Estoque Baixo
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'item está' : 'itens estão'} com estoque abaixo do mínimo
          </p>
        </div>
        <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
          {lowStockItems.length} itens
        </Badge>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
