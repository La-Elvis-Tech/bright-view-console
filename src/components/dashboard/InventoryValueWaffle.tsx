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
      if (!profile?.unit_id) return [];

      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          current_stock,
          cost_per_unit,
          inventory_categories(name, color)
        `)
        .eq('unit_id', profile.unit_id)
        .eq('active', true)
        .not('cost_per_unit', 'is', null)
        .order('current_stock', { ascending: false });

      if (error) throw error;

      const itemsWithValue = items
        ?.map(item => ({
          id: item.id,
          label: item.name,
          value: Math.round((item.current_stock || 0) * (item.cost_per_unit || 0)),
          color: '#525252' // Neutral gray for minimalist design
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
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/2"></div>
            <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <Package className="h-4 w-4 text-neutral-400" />
            Valor do Inventário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-400">
            <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum item com valor encontrado</p>
            <p className="text-xs mt-1">para sua unidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4 text-neutral-400" />
            Itens de Maior Valor em Estoque
          </span>
          <div className="text-right text-xs">
            <div className="text-neutral-600 dark:text-neutral-400 font-medium">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-neutral-400 text-xs">
              {inventoryData.length} itens
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveWaffle
            data={inventoryData}
            total={totalValue}
            rows={12}
            columns={16}
            padding={1}
            colors={['#525252', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5']}
            borderRadius={2}
            borderWidth={0}
            motionConfig="gentle"
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 30,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 16,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                itemTextColor: '#6B7280',
                symbolSize: 10,
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
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {data.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Valor total: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            }}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 10,
                fill: '#6B7280'
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryValueWaffle;
