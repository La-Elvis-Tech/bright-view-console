
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'update':
      case 'updated':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      case 'delete':
      case 'deleted':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          <Activity className="h-4 w-4 text-neutral-400" />
          Logs do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.length > 0 ? logs.map((log) => {
            const IconComponent = getActionIcon(log.resource_type);
            return (
              <div 
                key={log.id}
                className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded">
                    <IconComponent className="h-3 w-3 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs px-2 py-0.5 border ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                        {log.resource_type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {log.user_name}
                    </p>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-neutral-400">
              <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum log disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
