import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, TrendingUp, Download, BarChart3, Clock, User, Building2 } from "lucide-react";

import ReportsHeader from "@/components/reports/ReportsHeader";
import MetricsCards from "@/components/reports/MetricsCards";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";
import DashboardChart from "@/components/DashboardChart";
import { useReportsData, useReportMetrics } from "@/hooks/useReportsData";
import { useAuthContext } from "@/context/AuthContext";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("weekly");
  const [selectedUnit, setSelectedUnit] = useState<string>("default");
  
  const { profile, hasRole } = useAuthContext();
  
  const unitFilter = selectedUnit === "default" 
    ? undefined 
    : selectedUnit === "all" && (hasRole('admin') || hasRole('supervisor'))
    ? "all"
    : selectedUnit !== "default"
    ? selectedUnit
    : undefined;

  const { data: reportData, isLoading, error } = useReportsData(unitFilter);
  const metrics = reportData ? useReportMetrics(reportData) : null;

  const handleExport = (format: string, dataTypes: string[]) => {
    console.log(`Exporting ${dataTypes.join(', ')} in ${format} format`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-2 lg:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !reportData || !metrics) {
    return (
      <div className="min-h-screen">
        <div className="p-2 lg:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
            <CardContent className="p-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400 mb-2">
                Erro ao carregar dados dos relatórios
              </p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                {error?.message || 'Tente recarregar a página'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { appointmentMetrics, inventoryMetrics, chartData } = metrics;

  return (
    <div className="min-h-screen">
      <div className="p-2 lg:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-medium text-neutral-900 dark:text-neutral-100">
            Relatórios
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Análise completa de agendamentos, inventário e performance
          </p>
        </div>

        {/* Unit Selector for Admins */}
        {(hasRole('admin') || hasRole('supervisor')) && (
          <ReportsHeader
            selectedUnit={selectedUnit}
            onUnitChange={setSelectedUnit}
            units={reportData.units}
            showUnitSelector={true}
          />
        )}

        {/* Metrics Cards */}
        <MetricsCards 
          appointmentMetrics={appointmentMetrics}
          inventoryMetrics={inventoryMetrics}
          alertsCount={reportData.alerts.filter(alert => alert.status === 'active').length}
        />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-neutral-100 data-[state=active]:dark:bg-neutral-800"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-neutral-100 data-[state=active]:dark:bg-neutral-800"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="cost-analysis" 
                className="data-[state=active]:bg-neutral-100 data-[state=active]:dark:bg-neutral-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Análise de Custos
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="data-[state=active]:bg-neutral-100 data-[state=active]:dark:bg-neutral-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Charts Section */}
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
              <CardHeader className="p-6">
                <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                  Análise de Performance
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Visualização detalhada de receitas, agendamentos e estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={reportType} onValueChange={setReportType}>
                  <div className="overflow-x-auto mb-6">
                    <TabsList className="bg-neutral-50 dark:bg-neutral-800/40">
                      <TabsTrigger value="weekly">Receita Semanal</TabsTrigger>
                      <TabsTrigger value="monthly">Tendência Mensal</TabsTrigger>
                      <TabsTrigger value="byType">Por Tipo de Exame</TabsTrigger>
                      <TabsTrigger value="inventory">Estoque por Categoria</TabsTrigger>
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
              {/* Recent Appointments */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Agendamentos Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos procedimentos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.appointments
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 10)
                        .map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-3 w-3 text-neutral-400" />
                                <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                  {app.patient_name}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(app.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </div>
                                <div>{app.exam_types?.name || 'Exame'}</div>
                                {app.doctors?.name && (
                                  <div>Dr. {app.doctors.name}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">
                                R$ {(app.cost || app.exam_types?.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs border-0 ${
                                  app.status === 'Concluído'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
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

              {/* Recent Alerts */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
                    <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Alertas Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos alertas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.alerts.slice(0, 10).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.priority === 'critical'
                              ? 'border-l-red-500 bg-red-50/80 dark:bg-red-900/20'
                              : alert.priority === 'high'
                              ? 'border-l-orange-500 bg-orange-50/80 dark:bg-orange-900/20'
                              : 'border-l-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 block truncate">
                                {alert.title}
                              </span>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {alert.inventory_items?.name} · {format(new Date(alert.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={`text-xs border-0 mb-1 ${
                                  alert.priority === 'critical'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : alert.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                }`}
                              >
                                {alert.priority}
                              </Badge>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
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
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceMetrics selectedUnitId={unitFilter === "all" ? undefined : unitFilter} />
          </TabsContent>

          <TabsContent value="cost-analysis" className="mt-6">
            <CostAnalysis selectedUnitId={unitFilter === "all" ? undefined : unitFilter} />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
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
    </div>
  );
};

export default Reports;