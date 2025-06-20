
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Settings } from "lucide-react";
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
    if (logsRef.current) {
      gsap.fromTo(logsRef.current, 
        { 
          opacity: 0, 
          y: 20,
          scale: 0.98
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    }
  }, [logs]);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'text-green-600 dark:text-green-400';
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

  return (
    <Card ref={logsRef} className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Settings className="h-4 w-4" />
          Atividades do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.slice(0, 6).map((log) => (
            <div 
              key={log.id} 
              className="flex items-start gap-3 p-3 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40"
            >
              <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
