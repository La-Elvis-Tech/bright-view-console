import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  CheckCircle, 
  User, 
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { gsap } from "gsap";
import { toast } from "@/hooks/use-toast";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertFilters } from "@/components/alerts/AlertFilters";

// Mock data para histórico de alertas resolvidos
const mockResolvedAlerts = [
  {
    id: "R001",
    type: "stock",
    title: "Estoque Crítico - Pipetas 10mL",
    resolvedAt: new Date(2024, 5, 8, 11, 20),
    resolvedBy: "Ana Paula",
    action: "Reposição realizada - 50 unidades",
    status: "resolved"
  },
  {
    id: "R002",
    type: "expiry",
    title: "Vencimento Próximo - Buffer Z",
    resolvedAt: new Date(2024, 5, 7, 15, 30),
    resolvedBy: "Carlos Pereira",
    action: "Item descartado conforme protocolo",
    status: "resolved"
  }
];

// Mock data para log de serviços
const mockServiceLogs = [
  {
    id: "L001",
    type: "inventory_update",
    action: "Aumento de estoque",
    item: "Etanol Absoluto",
    details: "Quantidade alterada de 2L para 10L",
    user: "Ana Paula",
    timestamp: new Date(2024, 5, 12, 10, 30),
    module: "Inventário"
  },
  {
    id: "L002",
    type: "order_created",
    action: "Pedido criado",
    item: "Luvas Nitrila",
    details: "Pedido #P001 - 200 pares",
    user: "Carlos Pereira",
    timestamp: new Date(2024, 5, 12, 9, 15),
    module: "Pedidos"
  },
  {
    id: "L003",
    type: "exam_completed",
    action: "Exame realizado",
    item: "Kit Teste COVID",
    details: "Paciente: João Silva - Resultado: Negativo",
    user: "Dra. Maria Santos",
    timestamp: new Date(2024, 5, 11, 16, 45),
    module: "Exames"
  },
  {
    id: "L004",
    type: "maintenance",
    action: "Manutenção preventiva",
    item: "Equipamento Análise",
    details: "Calibração e limpeza realizada",
    user: "Técnico João",
    timestamp: new Date(2024, 5, 11, 14, 20),
    module: "Equipamentos"
  }
];

const Alerts = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("alerts");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    alerts,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  } = useAlerts();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleQuickAction = (alertId: string, action: string) => {
    console.log(`Ação: ${action} para alerta: ${alertId}`);
    toast({
      title: "Ação executada",
      description: `${action} foi processada com sucesso`,
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    const matchesReadStatus = !showUnreadOnly || !alert.isRead;
    return matchesSearch && matchesPriority && matchesReadStatus && alert.status === "active";
  });

  const filteredLogs = mockServiceLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Alertas & Notificações
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Gerencie alertas críticos e acompanhe o histórico de atividades
            </p>
          </div>
          {getUnreadCount() > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
              {getUnreadCount()} pendentes
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros e Busca */}
      <AlertFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        showUnreadOnly={showUnreadOnly}
        setShowUnreadOnly={setShowUnreadOnly}
        unreadCount={getUnreadCount()}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <Bell size={16} />
            Alertas Ativos
            {getUnreadCount() > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {getUnreadCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <CheckCircle size={16} />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <User size={16} />
            Log de Serviços
          </TabsTrigger>
        </TabsList>

        {/* Alertas Ativos */}
        <TabsContent value="alerts" className="mt-0">
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-8 text-center">
                  <div className="text-neutral-500 dark:text-neutral-400">
                    {showUnreadOnly 
                      ? "Nenhum alerta não lido encontrado" 
                      : "Nenhum alerta encontrado com os filtros aplicados"
                    }
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onQuickAction={handleQuickAction}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Histórico de Alertas Resolvidos */}
        <TabsContent value="resolved" className="mt-0">
          <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100">Alertas Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockResolvedAlerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {alert.action}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {alert.resolvedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(alert.resolvedAt, "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          Resolvido
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Log de Serviços */}
        <TabsContent value="logs" className="mt-0">
          <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100">Log de Atividades do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-neutral-300 dark:border-neutral-600">
                              {log.module}
                            </Badge>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {log.action}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            <span className="font-medium">Item:</span> {log.item}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {log.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(log.timestamp, "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;
