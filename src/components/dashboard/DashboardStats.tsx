
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
      iconColor: "text-blue-600"
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      iconColor: "text-green-600"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconColor: "text-emerald-600"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalInventoryItems || 0,
      icon: Package,
      iconColor: "text-indigo-600"
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      iconColor: "text-red-600"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: Users,
      iconColor: "text-purple-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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
          className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
