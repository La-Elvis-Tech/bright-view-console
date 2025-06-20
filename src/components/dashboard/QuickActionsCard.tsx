
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  BarChart3, 
  Bell, 
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

const QuickActionsCard: React.FC = () => {
  const [unreadAlerts] = useState(3);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
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
  }, []);

  const quickActions = [
    {
      title: "Inventário Crítico",
      description: "12 itens abaixo do mínimo",
      icon: Package,
      link: "/inventory?filter=critical",
      urgent: true
    },
    {
      title: "Agendamentos Hoje",
      description: "8 sessões programadas",
      icon: Calendar,
      link: "/orders",
      urgent: false
    },
    {
      title: "Nova Simulação",
      description: "Prever cenários futuros",
      icon: BarChart3,
      link: "#",
      urgent: false
    }
  ];

  return (
    <Card ref={cardRef} className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Acesso Rápido
          </span>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {unreadAlerts > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {unreadAlerts}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="block p-3 bg-neutral-50/80 dark:bg-neutral-800/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-all duration-200 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 group-hover:border-neutral-300/80 dark:group-hover:border-neutral-600/80 transition-colors">
                  <action.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    {action.title}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {action.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {action.urgent && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                )}
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
              </div>
            </div>
          </Link>
        ))}

        <div className="mt-4 p-3 bg-orange-50/80 dark:bg-orange-900/20 rounded-lg border border-orange-200/60 dark:border-orange-800/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              Alertas Recentes
            </span>
          </div>
          <div className="space-y-1 text-xs text-orange-700 dark:text-orange-400">
            <div>• Etanol Absoluto: 3L restantes</div>
            <div>• Luvas Nitrila: Estoque baixo</div>
            <div>• Reagente X: Vence em 5 dias</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
