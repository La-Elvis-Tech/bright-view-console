
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
      const bars = containerRef.current.querySelectorAll('.inventory-bar');
      gsap.fromTo(bars, 
        { 
          scaleX: 0,
          opacity: 0
        },
        { 
          scaleX: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading, inventoryData]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Package className="h-4 w-4" />
            Valor do Estoque por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Package className="h-4 w-4" />
            Valor do Estoque por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-3 text-neutral-400" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhum item em estoque</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Package className="h-4 w-4" />
          Valor do Estoque por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-4">
          {inventoryData.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {item.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="relative h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="inventory-bar absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.percentage}%`,
                    transformOrigin: 'left'
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
