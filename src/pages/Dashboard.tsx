
import React, { Suspense } from "react";
import { useAuthContext } from "@/context/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ExamTypesOverview from "@/components/dashboard/ExamTypesOverview";
import ExamResultsCalendar from "@/components/dashboard/ExamResultsCalendar";
import RecentActivities from "@/components/dashboard/RecentActivities";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import UnitSelectorCard from "@/components/dashboard/UnitSelectorCard";
import SkeletonDashboard from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuthContext();

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          Você precisa estar logado para acessar o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Bem-vindo de volta, {profile.full_name}
          </p>
        </div>
        <UnitSelectorCard />
      </div>

      <Suspense fallback={<SkeletonDashboard />}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stats - Linha superior */}
          <div className="lg:col-span-12">
            <DashboardStats />
          </div>

          {/* Calendar Chart - Nova seção */}
          <div className="lg:col-span-12">
            <ExamResultsCalendar />
          </div>

          {/* Exam Types Overview */}
          <div className="lg:col-span-4">
            <ExamTypesOverview />
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-4">
            <RecentActivities />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-4">
            <QuickActionsCard />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
