
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Package, Calendar, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SystemLog {
  id: string;
  action: string;
  resource_type: string;
  user_name: string;
  created_at: string;
  details: any;
}

interface SystemLogsPanelProps {
  logs: SystemLog[];
}

const SystemLogsPanel: React.FC<SystemLogsPanelProps> = ({ logs }) => {
  const getActionIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'appointment':
        return Calendar;
      case 'inventory':
        return Package;
      case 'user':
        return User;
      case 'system':
        return Settings;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'update':
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delete':
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6 border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Logs do Sistema
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Atividades recentes
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {logs.map((log) => {
          const IconComponent = getActionIcon(log.resource_type);
          return (
            <div 
              key={log.id}
              className="flex items-center gap-3 p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
            >
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <IconComponent size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${getActionColor(log.action)}`}>
                    {log.action}
                  </Badge>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    {log.resource_type}
                  </span>
                </div>
                <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate">
                  {log.user_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SystemLogsPanel;
