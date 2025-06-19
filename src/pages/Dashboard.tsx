
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
import { SkeletonDashboard } from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuthContext();
  const { metrics, examTrends, recentExams, systemLogs, loading } = useAdvancedDashboard();

  if (authLoading || loading) {
    return <SkeletonDashboard />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
        <div className="text-center p-8 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
          <p className="text-neutral-600 dark:text-neutral-400">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Bem-vindo de volta, {profile.full_name}
          </p>
        </div>

        <Suspense fallback={<SkeletonDashboard />}>
          {/* Stats Cards */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column - Charts and Analytics */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Exam Trends Chart */}
              {examTrends && <ExamTrendsChart data={examTrends} />}
              
              {/* Inventory Value Waffle */}
              <InventoryValueWaffle />
            </div>

            {/* Right Column - Quick Actions and Insights */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              <QuickActionsCard />
              {metrics && <PredictiveInsights metrics={metrics} />}
            </div>
          </div>

          {/* Bottom Section - Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Recent Exams */}
            <div>
              {recentExams && <RecentExamsTable exams={recentExams} />}
            </div>

            {/* System Logs */}
            <div>
              {systemLogs && <SystemLogsPanel logs={systemLogs} />}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
