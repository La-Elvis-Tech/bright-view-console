
import React, { useRef, useEffect } from "react";
import { ResponsiveWaffle } from "@nivo/waffle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { Package } from "lucide-react";
import { gsap } from "gsap";

const InventoryValueWaffle: React.FC = () => {
  const { profile } = useAuthContext();
  const waffleRef = useRef<HTMLDivElement>(null);

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventory-waffle', profile?.unit_id],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          current_stock, 
          cost_per_unit,
          categories:inventory_categories(name)
        `)
        .eq('unit_id', profile?.unit_id)
        .eq('active', true);

      if (error) throw error;

      const categoryData = items?.reduce((acc, item) => {
        const categoryName = item.categories?.name || 'Outros';
        const value = (item.current_stock || 0) * (item.cost_per_unit || 0);
        
        if (acc[categoryName]) {
          acc[categoryName] += value;
        } else {
          acc[categoryName] = value;
        }
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryData || {}).map(([id, value]) => ({
        id,
        label: id,
        value: Math.round(value)
      }));
    },
    enabled: !!profile?.unit_id
  });

  useEffect(() => {
    if (!isLoading && waffleRef.current) {
      gsap.fromTo(waffleRef.current, 
        { 
          opacity: 0, 
          y: 20,
          scale: 0.98
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
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

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Package className="h-4 w-4" />
          Valor do Estoque por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={waffleRef} className="h-48">
          <ResponsiveWaffle
            data={inventoryData}
            total={inventoryData.reduce((sum, item) => sum + item.value, 0)}
            rows={10}
            columns={14}
            padding={1}
            colors={['#f8f9fa', '#e9ecef', '#adb5bd', '#6c757d', '#343a40']}
            borderColor="transparent"
            borderWidth={0}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 40,
                itemsSpacing: 8,
                itemWidth: 80,
                itemHeight: 16,
                itemDirection: 'left-to-right',
                itemOpacity: 0.8,
                symbolSize: 10,
                itemTextColor: '#64748b',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            tooltip={({ data }) => (
              <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {data.label}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            theme={{
              text: {
                fontSize: 11,
                fill: '#64748b',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              },
              legends: {
                text: {
                  fontSize: 11,
                  fill: '#64748b'
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
