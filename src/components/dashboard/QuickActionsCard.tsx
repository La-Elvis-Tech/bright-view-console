
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  BarChart3, 
  Bell, 
  AlertTriangle,
  ChevronRight,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickActionsCard: React.FC = () => {
  const [unreadAlerts] = useState(5);

  const quickActions = [
    {
      title: "Inventário Crítico",
      description: "12 itens abaixo do mínimo",
      icon: Package,
      link: "/inventory?filter=critical",
      urgency: "high"
    },
    {
      title: "Agendamentos Hoje",
      description: "8 sessões programadas",
      icon: Calendar,
      link: "/orders",
      urgency: "medium"
    },
    {
      title: "Nova Simulação",
      description: "Prever cenários futuros",
      icon: BarChart3,
      link: "#",
      urgency: "low"
    }
  ];

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
          <span className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
            Acesso Rápido
          </span>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-indigo-600 dark:text-indigo-400" />
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {unreadAlerts}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="space-y-4 h-full flex flex-col mt-2">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`block p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 dark:hover:to-blue-950/60 transition-all duration-500 rounded-xl hover:shadow-sm border-none`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500/80 to-blue-800/80 rounded-lg text-white shadow-sm">
                    <action.icon size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))}

          {/* Alerts Feed */}
          <div className="mt-4 p-3 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/40 dark:to-orange-950/40 rounded-xl border border-red-200 dark:border-red-800/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Alertas Críticos
              </span>
            </div>
            <div className="space-y-1 text-xs text-red-600 dark:text-red-400">
              <div> Etanol Absoluto: 3L / Min 5L</div>
              <div> Luvas Nitrila: Estoque baixo</div>
              <div> Reagente X: Vence em 5 dias</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
