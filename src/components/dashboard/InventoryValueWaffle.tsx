
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
        .select('category, current_stock, unit_cost')
        .eq('unit_id', profile?.unit_id)
        .eq('active', true);

      if (error) throw error;

      const categoryData = items?.reduce((acc, item) => {
        const category = item.category || 'Outros';
        const value = (item.current_stock || 0) * (item.unit_cost || 0);
        
        if (acc[category]) {
          acc[category] += value;
        } else {
          acc[category] = value;
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
          y: 30,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Card className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Valor do Estoque por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 dark:border-neutral-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          Valor do Estoque por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={waffleRef} className="h-64">
          <ResponsiveWaffle
            data={inventoryData}
            total={inventoryData.reduce((sum, item) => sum + item.value, 0)}
            rows={12}
            columns={16}
            padding={1}
            colors={['#f3f4f6', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563']}
            borderColor="#ffffff"
            borderWidth={1}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 10,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 12,
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
            tooltip={({ label, value }) => (
              <div className="bg-white/95 dark:bg-neutral-800/95 p-3 rounded-lg shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {label}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            theme={{
              text: {
                fontSize: 11,
                fill: '#6b7280',
                outlineWidth: 0,
                outlineColor: 'transparent'
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
