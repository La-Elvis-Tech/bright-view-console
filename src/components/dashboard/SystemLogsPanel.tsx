
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Settings, Activity } from "lucide-react";
import { gsap } from "gsap";

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
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current && logs.length > 0) {
      const logItems = logsRef.current.querySelectorAll('.log-item');
      gsap.fromTo(logItems, 
        { 
          opacity: 0, 
          x: 20
        },
        { 
          opacity: 1, 
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [logs]);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'update':
      case 'updated':
        return 'text-blue-600 dark:text-blue-400';
      case 'delete':
      case 'deleted':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return '●';
      case 'update':
      case 'updated':
        return '◐';
      case 'delete':
      case 'deleted':
        return '◯';
      default:
        return '●';
    }
  };

  return (
    <Card ref={logsRef} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Settings className="h-4 w-4" />
          Atividades do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div 
                key={log.id} 
                className="log-item flex items-start gap-3 p-3 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50 transition-all duration-200"
              >
                <div className={`flex-shrink-0 mt-1 text-lg leading-none ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/50 px-2 py-0.5 rounded-full">
                      {log.resource_type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Por {log.user_name} • {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
            <p className="text-xs mt-1">do sistema</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
