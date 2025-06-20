
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Bem-vindo de volta, {profile.full_name}
          </p>
        </div>

        <Suspense fallback={<SkeletonDashboard />}>
          {/* Stats Cards */}
          <DashboardStats />

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
