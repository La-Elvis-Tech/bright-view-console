
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'update':
      case 'updated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
      case 'deleted':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Activity className="h-4 w-4 text-gray-400" />
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
                className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-50 rounded">
                    <IconComponent className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs px-2 py-0.5 border ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                      <span className="text-xs text-gray-500 capitalize">
                        {log.resource_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-900 truncate">
                      {log.user_name}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-400">
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
