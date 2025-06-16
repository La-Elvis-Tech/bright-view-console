
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardChart from "@/components/DashboardChart";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { subMonths } from "date-fns";

const CostAnalysis: React.FC = () => {
  const { profile } = useAuthContext();

  // Buscar dados reais de custos por tipo de exame
  const { data: examCosts = [] } = useQuery({
    queryKey: ['exam-costs', profile?.unit_id],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          cost,
          status,
          exam_types(name, cost, category)
        `)
        .eq('status', 'Concluído');

      if (profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por tipo de exame e calcular média de custos
      const costsByType: { [key: string]: { total: number; count: number } } = {};
      
      data?.forEach(appointment => {
        const examType = appointment.exam_types?.name || 'Outros';
        const cost = appointment.cost || appointment.exam_types?.cost || 0;
        
        if (!costsByType[examType]) {
          costsByType[examType] = { total: 0, count: 0 };
        }
        
        costsByType[examType].total += cost;
        costsByType[examType].count += 1;
      });

      return Object.entries(costsByType)
        .map(([name, { total, count }]) => ({
          name,
          value: count > 0 ? total / count : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    },
    enabled: !!profile
  });

  // Buscar dados de consumo por categoria (Pareto)
  const { data: paretoData = [] } = useQuery({
    queryKey: ['inventory-pareto', profile?.unit_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          total_cost,
          quantity,
          movement_type,
          inventory_items!inner(name, cost_per_unit, unit_id, inventory_categories(name))
        `)
        .eq('movement_type', 'saida')
        .gte('created_at', subMonths(new Date(), 3).toISOString());

      if (error) throw error;

      // Filtrar por unidade se necessário
      const filteredData = profile?.unit_id 
        ? data.filter(movement => movement.inventory_items.unit_id === profile.unit_id)
        : data;

      // Agrupar por item e calcular custos totais
      const costsByItem: { [key: string]: number } = {};
      
      filteredData?.forEach(movement => {
        const itemName = movement.inventory_items?.name || 'Item Desconhecido';
        const cost = movement.total_cost || 0;
        costsByItem[itemName] = (costsByItem[itemName] || 0) + cost;
      });

      const sortedItems = Object.entries(costsByItem)
        .map(([name, cost]) => ({ name, value: cost }))
        .sort((a, b) => b.value - a.value);

      const totalCost = sortedItems.reduce((sum, item) => sum + item.value, 0);
      let cumulativePercentage = 0;

      return sortedItems.slice(0, 8).map(item => {
        const percentage = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
        cumulativePercentage += percentage;
        return {
          name: item.name,
          value: Math.round(percentage),
          percentage: Math.round(cumulativePercentage)
        };
      });
    },
    enabled: !!profile
  });

  // Buscar dados de consumo por unidade (radar)
  const { data: radarData = [] } = useQuery({
    queryKey: ['consumption-by-unit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          total_cost,
          inventory_items!inner(units(name, code))
        `)
        .eq('movement_type', 'saida')
        .gte('created_at', subMonths(new Date(), 6).toISOString());

      if (error) throw error;

      // Agrupar por unidade
      const costsByUnit: { [key: string]: number } = {};
      
      data?.forEach(movement => {
        const unitName = movement.inventory_items?.units?.name || 'Unidade Principal';
        const cost = movement.total_cost || 0;
        costsByUnit[unitName] = (costsByUnit[unitName] || 0) + cost;
      });

      return Object.entries(costsByUnit)
        .map(([name, totalCost]) => ({
          name,
          gastosK: Math.round(totalCost / 1000) // Converter para milhares
        }))
        .slice(0, 6);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
            Custo Médio por Exame
          </CardTitle>
        </CardHeader>
        <CardContent>
          {examCosts.length > 0 ? (
            <DashboardChart
              type="bar"
              data={examCosts}
              title="Custo por Tipo de Exame"
              description="Média de custos por procedimento realizado"
            />
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              Nenhum dado de custo disponível
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Análise de Pareto - Itens mais Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paretoData.length > 0 ? (
              <DashboardChart
                type="progress"
                data={paretoData.map(item => ({ name: item.name, value: item.value }))}
                title="80/20 dos Gastos"
                description="20% dos itens representam 80% dos custos"
              />
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                Nenhum dado de consumo disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Radar de Consumo por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" minHeight={100} height={300} maxHeight={300}>
                <RadarChart
                  cx="50%" cy="50%" outerRadius={80} data={radarData}
                >
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#a2a6ad', fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    tick={{ fontSize: 10, fill: '#a2a6ad', fontWeight: 500 }}
                  />
                  <Radar
                    name="Gastos (em milhares R$)"
                    dataKey="gastosK"
                    stroke="#4e63bd"
                    fill="#322d9e"
                    fillOpacity={0.7}
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                Nenhum dado por unidade disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysis;
