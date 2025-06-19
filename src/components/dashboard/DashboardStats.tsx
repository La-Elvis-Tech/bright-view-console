
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { format, subDays } from "date-fns";

const DashboardStats: React.FC = () => {
  const { profile } = useAuthContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', profile?.unit_id],
    queryFn: async () => {
      if (!profile?.unit_id) {
        return {
          totalAppointments: 0,
          todayAppointments: 0,
          totalInventoryItems: 0,
          lowStockItems: 0,
          totalRevenue: 0,
          activeExamTypes: 0
        };
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [
        { data: appointments },
        { data: todayAppointments },
        { data: inventoryItems },
        { data: lowStockItems },
        { data: revenue },
        { data: examTypes }
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('id')
          .eq('unit_id', profile.unit_id),
        
        supabase
          .from('appointments')
          .select('id')
          .eq('unit_id', profile.unit_id)
          .gte('created_at', today),
        
        supabase
          .from('inventory_items')
          .select('id')
          .eq('unit_id', profile.unit_id)
          .eq('active', true),
        
        supabase
          .from('inventory_items')
          .select('id, current_stock, min_stock')
          .eq('unit_id', profile.unit_id)
          .eq('active', true),
        
        supabase
          .from('appointments')
          .select('cost')
          .eq('unit_id', profile.unit_id)
          .not('cost', 'is', null),
        
        supabase
          .from('exam_types')
          .select('id')
          .eq('unit_id', profile.unit_id)
          .eq('active', true)
      ]);

      const lowStockCount = lowStockItems?.filter(item => 
        item.current_stock < item.min_stock
      ).length || 0;

      const totalRevenue = revenue?.reduce((sum, appointment) => 
        sum + (appointment.cost || 0), 0) || 0;

      return {
        totalAppointments: appointments?.length || 0,
        todayAppointments: todayAppointments?.length || 0,
        totalInventoryItems: inventoryItems?.length || 0,
        lowStockItems: lowStockCount,
        totalRevenue,
        activeExamTypes: examTypes?.length || 0
      };
    },
    enabled: !!profile?.unit_id
  });

  const statsCards = [
    {
      title: "Total de Agendamentos",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalInventoryItems || 0,
      icon: Package,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {statsCards.map((stat, index) => (
        <Card 
          key={index}
          className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
