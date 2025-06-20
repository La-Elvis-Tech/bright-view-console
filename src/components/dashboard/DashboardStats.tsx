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
          y: 10,
          scale: 0.98
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
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
      change: "+12%"
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      change: "+5%"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: "+8%"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalInventoryItems || 0,
      icon: Package,
      change: "-2%"
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      change: stats?.lowStockItems > 0 ? "Atenção" : "OK"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: Users,
      change: "+1%"
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-3"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardContent className="p-6">
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsData.map((stat, index) => (
            <div 
              key={index}
              className="stat-card group p-4 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all duration-200"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stat.change.includes('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    stat.change.includes('-') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-neutral-100 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400'
                  }`}>
                    {stat.change}
                  </span>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;
