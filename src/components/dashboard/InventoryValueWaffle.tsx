
import React from "react";
import { ResponsiveWaffle } from "@nivo/waffle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { Package } from "lucide-react";

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

      // Calcular valor total (estoque * custo unitário) e pegar os 6 maiores
      const itemsWithValue = items
        ?.map(item => ({
          id: item.id,
          label: item.name,
          value: Math.round((item.current_stock || 0) * (item.cost_per_unit || 0)),
          color: item.categories?.color || '#6366f1'
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6) || [];

      return itemsWithValue;
    },
    enabled: !!profile?.unit_id
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
            Valor do Inventário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item com valor encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
          <span className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
            Itens de Maior Valor em Estoque
          </span>
          <div className="text-right text-sm">
            <div className="text-green-600 dark:text-green-400 font-semibold">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {inventoryData.length} itens
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveWaffle
            data={inventoryData}
            total={totalValue}
            rows={16}
            columns={20}
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
                translateY: 40,
                itemsSpacing: 2,
                itemWidth: 120,
                itemHeight: 18,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                itemTextColor: '#6B7280',
                symbolSize: 12,
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
            tooltip={(props) => {
              const data = props.data;
              return (
                <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {data.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Valor total: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            }}
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
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
