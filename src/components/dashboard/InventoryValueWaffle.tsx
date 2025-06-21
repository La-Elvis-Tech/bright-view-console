
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { Package } from "lucide-react";
import { gsap } from "gsap";

interface CategoryData {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const InventoryValueWaffle: React.FC = () => {
  const { profile } = useAuthContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventory-waffle', profile?.unit_id],
    queryFn: async (): Promise<CategoryData[]> => {
      if (!profile?.unit_id) return [];

      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          current_stock, 
          cost_per_unit,
          categories:inventory_categories(name, color)
        `)
        .eq('unit_id', profile.unit_id)
        .eq('active', true);

      if (error) throw error;

      const categoryData = items?.reduce((acc, item) => {
        const categoryName = item.categories?.name || 'Outros';
        const categoryColor = item.categories?.color || '#6B7280';
        const value = (item.current_stock || 0) * (item.cost_per_unit || 0);
        
        if (acc[categoryName]) {
          acc[categoryName].value += value;
        } else {
          acc[categoryName] = { value, color: categoryColor };
        }
        return acc;
      }, {} as Record<string, { value: number; color: string }>);

      const totalValue = Object.values(categoryData || {}).reduce((sum, cat) => sum + cat.value, 0);

      return Object.entries(categoryData || {}).map(([name, data]) => ({
        id: name,
        label: name,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        color: data.color
      })).sort((a, b) => b.value - a.value).slice(0, 4);
    },
    enabled: !!profile?.unit_id
  });

  useEffect(() => {
    if (!isLoading && containerRef.current && inventoryData.length > 0) {
      const items = containerRef.current.querySelectorAll('.category-item');
      gsap.fromTo(items, 
        { 
          opacity: 0,
          x: -10
        },
        { 
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, inventoryData]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Valor por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 ">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                    <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                  </div>
                  <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Valor por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhum item</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">em estoque</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          Valor por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-4 px-3 py-5 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all duration-200">
          {/* Total Value */}
          <div className="text-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total</p>
            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            {inventoryData.map((item) => (
              <div key={item.id} className="category-item">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${item.percentage}%`
                    }}
                  />
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
