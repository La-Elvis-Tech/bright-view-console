
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Users, Calendar, DollarSign, Package, AlertTriangle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardData";

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
            <CardContent className="pt-4 sm:pt-5 p-3 md:p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Agendamentos Ativos",
      value: stats?.pendingAppointments || 0,
      icon: Calendar,
      trend: "up",
      trendValue: `${stats?.totalAppointments || 0} total`,
      description: "pendentes",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: "up",
      trendValue: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total`,
      description: "este mês",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/40"
    },
    {
      title: "Itens em Estoque",
      value: stats?.totalItems || 0,
      icon: Package,
      trend: "up",
      trendValue: `${stats?.activeExamTypes || 0} tipos de exames`,
      description: "ativos",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Tipos de Exames",
      value: stats?.activeExamTypes || 0,
      icon: AlertTriangle,
      trend: "up",
      trendValue: `${stats?.totalExamTypes || 0} total`,
      description: "disponíveis",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/40"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp size={12} className="mr-1" />;
      case "down": return <TrendingDown size={12} className="mr-1" />;
      case "warning": return <AlertCircle size={12} className="mr-1" />;
      default: return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600 dark:text-green-400";
      case "down": return "text-red-600 dark:text-red-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
          <CardContent className="pt-4 sm:pt-5 p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-white truncate">
                  {stat.value}
                </h3>
                <p className={`text-xs flex items-center ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span className="truncate">{stat.trendValue}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
