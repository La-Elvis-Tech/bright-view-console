
import React, { Suspense } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useAdvancedDashboard } from "@/hooks/useAdvancedDashboard";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import ExamTrendsChart from "@/components/dashboard/ExamTrendsChart";
import RecentExamsTable from "@/components/dashboard/RecentExamsTable";
import SystemLogsPanel from "@/components/dashboard/SystemLogsPanel";
import PredictiveInsights from "@/components/dashboard/PredictiveInsights";
import InventoryValueWaffle from "@/components/dashboard/InventoryValueWaffle";
import ExamResultsCalendar from "@/components/dashboard/ExamResultsCalendar";
import RiskAlertsCard from "@/components/dashboard/RiskAlertsCard";
import { SkeletonDashboard } from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuthContext();
  const { metrics, examTrends, recentExams, systemLogs, loading } = useAdvancedDashboard();

  if (authLoading || loading) {
    return <SkeletonDashboard />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-2 lg:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-medium text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Bem-vindo de volta, {profile.full_name}
          </p>
        </div>

        <Suspense fallback={<SkeletonDashboard />}>
          {/* Stats Cards */}
          <DashboardStats />

          {/* Calendar Section */}
          <ExamResultsCalendar />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Primary Chart */}
            <div className="lg:col-span-1 xl:col-span-1">
              {examTrends && <ExamTrendsChart data={examTrends} />}
            </div>

            {/* Secondary Chart */}
            <div className="lg:col-span-1 xl:col-span-1">
              <InventoryValueWaffle />
            </div>

            {/* Quick Actions and Risk Alerts */}
            <div className="lg:col-span-1 xl:col-span-1">
              <div className="space-y-6 h-full">
                <QuickActionsCard />
                <RiskAlertsCard />
              </div>
            </div>
          </div>

          {/* Bottom Section - Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="min-h-0">
              <RecentExamsTable />
            </div>
            <div className="min-h-0">
              {systemLogs && <SystemLogsPanel logs={systemLogs} />}
            </div>
            <div className="min-h-0">
              {metrics && <PredictiveInsights metrics={metrics} />}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
