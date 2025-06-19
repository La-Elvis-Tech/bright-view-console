
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Package, Calendar, Settings, Shield } from "lucide-react";
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
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          Logs do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length > 0 ? logs.map((log) => {
            const IconComponent = getActionIcon(log.resource_type);
            return (
              <div 
                key={log.id}
                className="p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-950/40 dark:to-red-950/40 rounded-xl border border-orange-100 dark:border-orange-800/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500/80 to-red-500/80 rounded-lg text-white shadow-sm">
                    <IconComponent size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {log.resource_type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {log.user_name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
