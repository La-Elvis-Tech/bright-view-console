
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";

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
      iconColor: "text-neutral-600 dark:text-neutral-400"
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      iconColor: "text-neutral-600 dark:text-neutral-400"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconColor: "text-neutral-600 dark:text-neutral-400"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalInventoryItems || 0,
      icon: Package,
      iconColor: "text-neutral-600 dark:text-neutral-400"
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      iconColor: "text-red-600 dark:text-red-400"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: Users,
      iconColor: "text-neutral-600 dark:text-neutral-400"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-1/2"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsCards.map((stat, index) => (
        <Card 
          key={index}
          className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
