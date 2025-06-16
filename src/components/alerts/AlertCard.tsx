
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  Bell, 
  Calendar,
  ShoppingCart,
  Eye,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { Alert } from "@/hooks/useAlerts";

interface AlertCardProps {
  alert: Alert;
  onQuickAction: (alertId: string, action: string) => void;
  onMarkAsRead: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  onQuickAction, 
  onMarkAsRead 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      default: return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock": return <Package size={16} />;
      case "expiry": return <Clock size={16} />;
      case "prediction": return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !alert.isRead 
        ? 'bg-blue-50/70 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
        : 'bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-neutral-600 dark:text-neutral-400">
            {getTypeIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
                  {alert.title}
                </h3>
                <div className="flex items-center gap-1">
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority === "critical" ? "Crítico" : 
                     alert.priority === "high" ? "Alto" : "Médio"}
                  </Badge>
                  {!alert.isRead && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      Novo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
              {alert.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(alert.createdAt, "dd/MM/yyyy HH:mm")}
              </span>
              <span>Item: {alert.item}</span>
            </div>

            {/* Botões de ação reorganizados */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => onQuickAction(alert.id, "Repor")}
                  className="h-8 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs"
                >
                  Repor
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onQuickAction(alert.id, "Reservar")}
                  className="h-8 px-3 border-neutral-300 dark:border-neutral-600 text-xs"
                >
                  Reservar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onQuickAction(alert.id, "Pedido")}
                  className="h-8 px-2 border-neutral-300 dark:border-neutral-600"
                >
                  <ShoppingCart size={14} />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                {!alert.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsRead(alert.id)}
                    className="h-8 px-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <Eye size={14} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAction(alert.id, "Resolver")}
                  className="h-8 px-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <CheckCircle2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
