
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
import { subMonths, format } from "date-fns";

const CostAnalysis: React.FC = () => {
  // Buscar dados reais de custos por tipo de exame
  const { data: examCosts = [] } = useQuery({
    queryKey: ['exam-costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          cost,
          status,
          exam_types(name, cost, category)
        `)
        .eq('status', 'Concluído');

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
    }
  });

  // Buscar dados de consumo por categoria (Pareto)
  const { data: paretoData = [] } = useQuery({
    queryKey: ['inventory-pareto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          total_cost,
          quantity,
          movement_type,
          inventory_items(name, cost_per_unit, inventory_categories(name))
        `)
        .eq('movement_type', 'saida')
        .gte('created_at', subMonths(new Date(), 3).toISOString());

      if (error) throw error;

      // Agrupar por item e calcular custos totais
      const costsByItem: { [key: string]: number } = {};
      
      data?.forEach(movement => {
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
    }
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
          inventory_items(units(name, code))
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

  // Dados de backup caso não haja dados reais
  const defaultExamCosts = [
    { name: "Coleta de Sangue", value: 45.5 },
    { name: "Ultrassom", value: 125.3 },
    { name: "Raio-X", value: 78.9 },
    { name: "Tomografia", value: 245.6 },
    { name: "Mamografia", value: 156.8 },
  ];

  const defaultParetoData = [
    { name: "Reagente X", value: 45, percentage: 45 },
    { name: "Equipamento Y", value: 25, percentage: 70 },
    { name: "Descartável Z", value: 15, percentage: 85 },
    { name: "Vidraria A", value: 10, percentage: 95 },
    { name: "Outros", value: 5, percentage: 100 },
  ];

  const defaultRadarData = [
    { name: "Unidade Principal", gastosK: 722 },
    { name: "Filial Norte", gastosK: 295 },
    { name: "Filial Sul", gastosK: 911 },
    { name: "Filial Leste", gastosK: 396 },
    { name: "Filial Oeste", gastosK: 1059 },
  ];

  const finalExamCosts = examCosts.length > 0 ? examCosts : defaultExamCosts;
  const finalParetoData = paretoData.length > 0 ? paretoData : defaultParetoData;
  const finalRadarData = radarData.length > 0 ? radarData : defaultRadarData;

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
            Custo Médio por Exame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardChart
            type="bar"
            data={finalExamCosts}
            title="Custo por Tipo de Exame"
            description="Média de custos por procedimento realizado"
          />
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
            <DashboardChart
              type="progress"
              data={finalParetoData.map(item => ({ name: item.name, value: item.value }))}
              title="80/20 dos Gastos"
              description="20% dos itens representam 80% dos custos"
            />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Radar de Consumo por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" minHeight={100} height={500} maxHeight={500}>
              <RadarChart
                cx="50%" cy="50%" outerRadius={140} data={finalRadarData}
              >
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="name"
                  tick={{ fontSize: 14, fill: '#a2a6ad', fontWeight: 500 }}
                  tickFormatter={(value) => {
                    const words = value.split(" ");
                    if (words.length >= 2) {
                      return words.slice(-2).join(" ");
                    }
                    return words[0];
                  }}
                />
                <PolarRadiusAxis 
                  tick={{ fontSize: 12, fill: '#a2a6ad', fontWeight: 500 }}
                />
                <Radar
                  name="Gastos (em milhares R$)"
                  dataKey="gastosK"
                  stroke="#4e63bd"
                  fill="#322d9e"
                  fillOpacity={0.7}
                />
                <Legend
                  iconSize={10}
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="bottom"
                  align="left"
                  wrapperStyle={{ paddingRight: 20, fontSize: 14, fontWeight: 500 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysis;
