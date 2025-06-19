
import React, { Suspense } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useAdvancedDashboard } from "@/hooks/useAdvancedDashboard";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import ExamTrendsChart from "@/components/dashboard/ExamTrendsChart";
import RecentExamsTable from "@/components/dashboard/RecentExamsTable";
import SystemLogsPanel from "@/components/dashboard/SystemLogsPanel";
import PredictiveInsights from "@/components/dashboard/PredictiveInsights";
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
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Bem-vindo de volta, {profile.full_name}
            </p>
          </div>
        </div>

        <Suspense fallback={<SkeletonDashboard />}>
          {/* Métricas principais */}
          {metrics && <MetricsGrid metrics={metrics} />}

          {/* Layout em grid responsivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gráfico de tendências - 8 colunas */}
            <div className="lg:col-span-8">
              {examTrends && <ExamTrendsChart data={examTrends} />}
            </div>

            {/* Insights preditivos - 4 colunas */}
            <div className="lg:col-span-4">
              {metrics && <PredictiveInsights metrics={metrics} />}
            </div>

            {/* Exames recentes - 6 colunas */}
            <div className="lg:col-span-6">
              {recentExams && <RecentExamsTable exams={recentExams} />}
            </div>

            {/* Logs do sistema - 6 colunas */}
            <div className="lg:col-span-6">
              {systemLogs && <SystemLogsPanel logs={systemLogs} />}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
