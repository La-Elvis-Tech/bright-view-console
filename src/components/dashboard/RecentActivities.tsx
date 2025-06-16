
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Stethoscope } from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";

const RecentActivities: React.FC = () => {
  const { data: recentActivity, isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivity?.map((activity, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/70 transition-colors"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                {activity.paciente ? (
                  <Stethoscope size={16} className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.paciente && `Paciente: ${activity.paciente}`}
                    {activity.responsavel && `Por: ${activity.responsavel}`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.day}, {activity.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
