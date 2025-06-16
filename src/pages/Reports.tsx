import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Calendar, DollarSign, FileText, Package, AlertTriangle, Users, Building } from "lucide-react";

import DashboardChart from "@/components/DashboardChart";
import AdvancedFilters from "@/components/reports/AdvancedFilters";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";
import { useReportsData, useReportMetrics } from "@/hooks/useReportsData";
import { useAuthContext } from "@/context/AuthContext";

const Reports = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("weekly");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [filters, setFilters] = useState({});
  
  const { profile, hasRole } = useAuthContext();
  // Pass undefined to useReportsData when "all" is selected, otherwise pass the selectedUnit
  const unitFilter = selectedUnit === "all" ? undefined : selectedUnit;
  const { data: reportData, isLoading } = useReportsData(unitFilter);
  const metrics = reportData ? useReportMetrics(reportData) : null;

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

  const handleExport = (format: string, dataTypes: string[]) => {
    console.log(`Exporting ${dataTypes.join(', ')} in ${format} format`);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-blue mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!reportData || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Não foi possível carregar os dados dos relatórios.</p>
        </div>
      </div>
    );
  }

  const { appointmentMetrics, inventoryMetrics, chartData } = metrics;

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="rounded-lg mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Relatórios Avançados
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Análise detalhada com métricas de performance e dados em tempo real
        </p>
      </div>

      {/* Seletor de unidade - apenas para admins/supervisores */}
      {(hasRole('admin') || hasRole('supervisor')) && reportData.units.length > 0 && (
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span className="text-sm font-medium">Unidade:</span>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {reportData.units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mx-1 xl:-mx-3 px-0 sm:px-2">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="cost-analysis" className="text-xs sm:text-sm">
              Análises
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm">
              Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    R$ {appointmentMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    Total de exames concluídos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Agendamentos</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{appointmentMetrics.total}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {appointmentMetrics.thisMonth} este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Itens em Estoque</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{inventoryMetrics.totalItems}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {inventoryMetrics.lowStock} em estoque baixo
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alertas Ativos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {reportData.alerts.filter(alert => alert.status === 'active').length}
                  </div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {inventoryMetrics.expiringSoon} vencendo em 30 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                  Análise de Performance
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Visualização detalhada de receitas, agendamentos e estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Tabs value={reportType} onValueChange={setReportType}>
                  <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
                    <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-neutral-50 dark:bg-neutral-800">
                      <TabsTrigger value="weekly" className="text-xs sm:text-sm">
                        Receita Semanal
                      </TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs sm:text-sm">
                        Tendência Mensal
                      </TabsTrigger>
                      <TabsTrigger value="byType" className="text-xs sm:text-sm">
                        Por Tipo de Exame
                      </TabsTrigger>
                      <TabsTrigger value="inventory" className="text-xs sm:text-sm">
                        Estoque por Categoria
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="weekly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={chartData.weeklyRevenue}
                      title="Receita dos Últimos 7 Dias"
                      description="Receita diária de exames concluídos"
                    />
                  </TabsContent>

                  <TabsContent value="monthly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={chartData.monthlyTrends.map(item => ({ name: item.name, value: item.revenue }))}
                      title="Receita Mensal (Últimos 6 Meses)"
                      description="Evolução da receita ao longo dos meses"
                    />
                  </TabsContent>

                  <TabsContent value="byType" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={chartData.appointmentsByType}
                      title="Agendamentos por Tipo de Exame"
                      description="Distribuição dos tipos de exames mais solicitados"
                    />
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={chartData.inventoryByCategory}
                      title="Distribuição de Estoque por Categoria"
                      description="Percentual de itens por categoria de inventário"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                    Agendamentos Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos procedimentos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.appointments.slice(0, 10).map((app) => (
                        <div
                          key={app.id}
                          className="border-l-4 border-l-blue-500 pl-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-r-md px-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                {app.patient_name}
                              </span>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {format(new Date(app.scheduled_date), "dd/MM/yyyy")} · {app.exam_types?.name || 'Exame'}
                              </div>
                              {app.doctors?.name && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Dr. {app.doctors.name}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                R$ {(app.cost || app.exam_types?.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Badge
                                variant="outline"
                                className={`block mt-1 text-xs ${
                                  app.status === 'Concluído'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : app.status === 'Cancelado'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                }`}
                              >
                                {app.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                    Alertas Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos alertas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`border-l-4 pl-3 py-2 rounded-r-md px-4 ${
                            alert.priority === 'critical'
                              ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                              : alert.priority === 'high'
                              ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                {alert.title}
                              </span>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {alert.inventory_items?.name} · {format(new Date(alert.created_at), "dd/MM/yyyy")}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  alert.priority === 'critical'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : alert.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                }`}
                              >
                                {alert.priority}
                              </Badge>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {alert.alert_type}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="cost-analysis" className="mt-0">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <ExportControls 
            data={reportData.appointments} 
            reportType={reportType} 
            onExport={handleExport}
            additionalData={{
              'Inventário': reportData.inventory,
              'Movimentações': reportData.movements,
              'Alertas': reportData.alerts
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
