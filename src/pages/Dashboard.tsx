
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
import { SkeletonDashboard } from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuthContext();
  const { metrics, examTrends, recentExams, systemLogs, loading } = useAdvancedDashboard();

  if (authLoading || loading) {
    return <SkeletonDashboard />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {examTrends && <ExamTrendsChart data={examTrends} />}
              <InventoryValueWaffle />
            </div>

            {/* Right Column - Quick Actions and Insights */}
            <div className="space-y-6">
              <QuickActionsCard />
              {metrics && <PredictiveInsights metrics={metrics} />}
            </div>
          </div>

          {/* Bottom Section - Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {recentExams && <RecentExamsTable exams={recentExams} />}
            </div>
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
