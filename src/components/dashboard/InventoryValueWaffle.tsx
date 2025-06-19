
import React from "react";
import { ResponsiveWaffle } from "@nivo/waffle";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

interface InventoryValueData {
  id: string;
  label: string;
  value: number;
  color: string;
}

const InventoryValueWaffle: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventory-value-waffle', profile?.unit_id],
    queryFn: async (): Promise<InventoryValueData[]> => {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          current_stock,
          cost_per_unit,
          categories:inventory_categories(name, color)
        `)
        .eq('unit_id', profile?.unit_id)
        .eq('active', true)
        .not('cost_per_unit', 'is', null)
        .order('current_stock', { ascending: false });

      if (error) throw error;

      // Calcular valor total (estoque * custo unitário) e pegar os 4 maiores
      const itemsWithValue = items
        ?.map(item => ({
          id: item.id,
          label: item.name,
          value: Math.round((item.current_stock || 0) * (item.cost_per_unit || 0)),
          color: item.categories?.color || '#6B7280'
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 4) || [];

      return itemsWithValue;
    },
    enabled: !!profile?.unit_id
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
        <div className="p-6 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">Nenhum item com valor encontrado</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Itens de Maior Valor em Estoque
          </h2>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveWaffle
            data={inventoryData}
            total={inventoryData.reduce((sum, item) => sum + item.value, 0)}
            rows={18}
            columns={14}
            padding={1}
            colors={{ datum: 'color' }}
            borderRadius={3}
            borderWidth={0}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 0.3]]
            }}
            motionConfig="gentle"
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 36,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                itemTextColor: '#6B7280',
                symbolSize: 14,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#1F2937'
                    }
                  }
                ]
              }
            ]}
            tooltip={({ id, label, value, color }) => (
              <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {label}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Valor total: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
                fill: '#6B7280'
              },
              tooltip: {
                container: {
                  background: 'white',
                  color: 'inherit',
                  fontSize: 'inherit',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px'
                }
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default InventoryValueWaffle;
