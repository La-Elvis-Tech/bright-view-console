import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface DepletionItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}
const LowStockTable: React.FC = () => {
  const {
    data: itemsNearDepletion,
    isLoading
  } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async (): Promise<DepletionItem[]> => {
      const {
        data,
        error
      } = await supabase.from('inventory_items').select('id, name, current_stock, min_stock, unit_measure').eq('active', true).order('current_stock', {
        ascending: true
      }).limit(4);
      if (error) throw error;

      // Filter items where current stock is below minimum stock
      const lowStockItems = data?.filter(item => item.current_stock <= item.min_stock) || [];
      return lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        unit: item.unit_measure
      }));
    }
  });
  if (isLoading) {
    return <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>;
  }
  return <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      
    </Card>;
};
export default LowStockTable;