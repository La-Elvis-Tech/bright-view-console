import React, { useRef, useEffect } from "react";
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
import { gsap } from "gsap";

const DashboardStats: React.FC = () => {
  const { profile } = useAuthContext();
  const statsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isLoading && statsRef.current) {
      const cards = statsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(cards, 
        { 
          opacity: 0, 
          y: 20,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading]);

  const statsData = [
    {
      title: "Total de Agendamentos",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200/50 dark:border-blue-800/50"
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200/50 dark:border-purple-800/50"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalInventoryItems || 0,
      icon: Package,
      color: "from-amber-500/10 to-amber-600/10",
      iconColor: "text-amber-600 dark:text-amber-500",
      borderColor: "border-amber-200/50 dark:border-amber-800/50"
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "from-red-500/10 to-red-600/10",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200/50 dark:border-red-800/50"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: Users,
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200/50 dark:border-indigo-800/50"
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-3"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statsData.map((stat, index) => (
            <div 
              key={index}
              className={`stat-card relative group cursor-pointer transition-all duration-300 hover:scale-105`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className={`relative p-4 rounded-xl border ${stat.borderColor} bg-white/30 dark:bg-neutral-800/30 backdrop-blur-sm`}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-2 rounded-lg bg-white/50 dark:bg-neutral-800/50 ${stat.iconColor}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;
