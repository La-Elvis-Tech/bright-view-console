
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
      })).sort((a, b) => b.value - a.value);
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
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Package className="h-4 w-4" />
            Valor por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Package className="h-4 w-4" />
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Package className="h-4 w-4" />
          Valor por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-3">
          {/* Total Value */}
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Valor Total</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Categories */}
          {inventoryData.map((item) => (
            <div key={item.id} className="category-item">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.percentage}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
