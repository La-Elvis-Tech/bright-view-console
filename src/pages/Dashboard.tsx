import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import DashboardChart from "@/components/DashboardChart.tsx";

// Import refactored components
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import InventoryGauges from "@/components/dashboard/InventoryGauges";
import LowStockTable from "@/components/dashboard/LowStockTable";

// Import existing dashboard components
import DemandForecastCard from "@/components/dashboard/DemandForecastCard";
import RiskAlertsCard from "@/components/dashboard/RiskAlertsCard";
import ForecastPerformanceCard from "@/components/dashboard/ForecastPerformanceCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import UnitSelectorCard from "@/components/dashboard/UnitSelectorCard";

// Data imports
import { useConsumptionData, useAppointmentTrends } from "@/hooks/useDashboardData";
import { SkeletonDashboard } from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { data: consumptionData, isLoading: consumptionLoading } = useConsumptionData();
  const { data: appointmentTrends, isLoading: trendsLoading } = useAppointmentTrends();

  const loading = consumptionLoading || trendsLoading;

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".dashboard-chart",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div
      ref={dashboardRef}
      className="space-y-6 dark:text-gray-100"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Visão geral do sistema de agendamentos e inventário
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="dashboard-card">
        <DashboardStats />
      </div>

      {/* Grid principal com layout mais equilibrado */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Coluna da esquerda - Unidades e métricas principais */}
        <div className="xl:col-span-4 space-y-6">
          <div className="dashboard-card h-[400px]">
            <UnitSelectorCard />
          </div>
          
          <div className="dashboard-card">
            <InventoryGauges />
          </div>
        </div>

        {/* Coluna central - Analytics avançados */}
        <div className="xl:col-span-4 space-y-6">
          <div className="dashboard-chart">
            <DashboardChart
              type="area"
              data={appointmentTrends || []}
              title="Tendência de Agendamentos"
              description="Agendamentos realizados nos últimos 6 meses"
            />
          </div>
          
          <div className="dashboard-card">
            <ForecastPerformanceCard />
          </div>
        </div>

        {/* Coluna da direita - Ações e alertas */}
        <div className="xl:col-span-4 space-y-6">
          <div className="dashboard-card">
            <QuickActionsCard />
          </div>
          
          <div className="dashboard-card">
            <RecentActivities />
          </div>

          <div className="dashboard-card">
            <DemandForecastCard />
          </div>
        </div>
      </div>

      {/* Seção de alertas de risco */}
      <div className="dashboard-chart">
        <RiskAlertsCard />
      </div>

      {/* Gráfico de consumo */}
      <div className="dashboard-card">
        <DashboardChart
          type="bar"
          data={consumptionData || []}
          title="Consumo de Materiais"
          description="Materiais consumidos nos últimos 7 meses"
        />
      </div>

      {/* Tabela de estoque baixo - largura total */}
      <div className="dashboard-chart">
        <LowStockTable />
      </div>
    </div>
  );
};

export default Dashboard;
