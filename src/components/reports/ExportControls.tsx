
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, Database, Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ExportControlsProps {
  data: any[];
  reportType: string;
  onExport: (format: string, dataTypes: string[]) => void;
  additionalData?: Record<string, any[]>;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  data,
  reportType,
  onExport,
  additionalData = {}
}) => {
  const [selectedFormat, setSelectedFormat] = useState("xlsx");
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(["appointments"]);
  const [dateRange, setDateRange] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{from?: Date; to?: Date}>({});
  const { toast } = useToast();

  const dataTypeOptions = [
    { id: "appointments", label: "Agendamentos", icon: CalendarIcon },
    { id: "inventory", label: "Inventário", icon: Database },
    { id: "movements", label: "Movimentações", icon: FileText },
    { id: "alerts", label: "Alertas", icon: FileText }
  ];

  const formatOptions = [
    { value: "xlsx", label: "Excel (.xlsx)", icon: FileText },
    { value: "csv", label: "CSV (.csv)", icon: Database },
    { value: "json", label: "JSON (.json)", icon: Database }
  ];

  const dateRangeOptions = [
    { value: "all", label: "Todos os dados" },
    { value: "7days", label: "Últimos 7 dias" },
    { value: "30days", label: "Últimos 30 dias" },
    { value: "90days", label: "Últimos 90 dias" },
    { value: "custom", label: "Período personalizado" }
  ];

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const filterDataByDate = (data: any[], dateField = 'created_at') => {
    if (dateRange === "all") return data;
    
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "90days":
        startDate = subDays(now, 90);
        break;
      case "custom":
        if (!customDateRange.from) return data;
        startDate = customDateRange.from;
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.scheduled_date || item.created_at);
      const isAfterStart = itemDate >= startDate;
      const isBeforeEnd = dateRange === "custom" && customDateRange.to 
        ? itemDate <= customDateRange.to 
        : true;
      return isAfterStart && isBeforeEnd;
    });
  };

  const prepareExportData = () => {
    const exportData: Record<string, any[]> = {};
    
    selectedDataTypes.forEach(dataType => {
      switch (dataType) {
        case "appointments":
          exportData["Agendamentos"] = filterDataByDate(data, 'scheduled_date').map(item => ({
            "Nome do Paciente": item.patient_name,
            "Email": item.patient_email,
            "Telefone": item.patient_phone,
            "Data Agendada": format(new Date(item.scheduled_date), 'dd/MM/yyyy HH:mm'),
            "Status": item.status,
            "Custo": item.cost,
            "Médico": item.doctors?.name || '',
            "Tipo de Exame": item.exam_types?.name || '',
            "Unidade": item.units?.name || '',
            "Data Criação": format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')
          }));
          break;
        case "inventory":
          if (additionalData["Inventário"]) {
            exportData["Inventário"] = filterDataByDate(additionalData["Inventário"]).map(item => ({
              "Nome": item.name,
              "Descrição": item.description,
              "Estoque Atual": item.current_stock,
              "Estoque Mínimo": item.min_stock,
              "Custo por Unidade": item.cost_per_unit,
              "Unidade de Medida": item.unit_measure,
              "Fornecedor": item.supplier,
              "Data Validade": item.expiry_date ? format(new Date(item.expiry_date), 'dd/MM/yyyy') : '',
              "Categoria": item.inventory_categories?.name || '',
              "Unidade": item.units?.name || '',
              "Ativo": item.active ? 'Sim' : 'Não'
            }));
          }
          break;
        case "movements":
          if (additionalData["Movimentações"]) {
            exportData["Movimentações"] = filterDataByDate(additionalData["Movimentações"]).map(item => ({
              "Item": item.inventory_items?.name || '',
              "Tipo de Movimento": item.movement_type,
              "Quantidade": item.quantity,
              "Custo Unitário": item.unit_cost,
              "Custo Total": item.total_cost,
              "Motivo": item.reason,
              "Data": format(new Date(item.created_at), 'dd/MM/yyyy HH:mm'),
              "Categoria": item.inventory_items?.inventory_categories?.name || ''
            }));
          }
          break;
        case "alerts":
          if (additionalData["Alertas"]) {
            exportData["Alertas"] = filterDataByDate(additionalData["Alertas"]).map(item => ({
              "Título": item.title,
              "Descrição": item.description,
              "Tipo": item.alert_type,
              "Prioridade": item.priority,
              "Status": item.status,
              "Item": item.inventory_items?.name || '',
              "Valor Atual": item.current_value,
              "Valor Limite": item.threshold_value,
              "Data Criação": format(new Date(item.created_at), 'dd/MM/yyyy HH:mm'),
              "Data Resolução": item.resolved_at ? format(new Date(item.resolved_at), 'dd/MM/yyyy HH:mm') : ''
            }));
          }
          break;
      }
    });
    
    return exportData;
  };

  const handleExport = () => {
    try {
      const exportData = prepareExportData();
      const dataKeys = Object.keys(exportData);
      
      if (dataKeys.length === 0) {
        toast({
          title: "Nenhum dado selecionado",
          description: "Selecione pelo menos um tipo de dados para exportar.",
          variant: "destructive"
        });
        return;
      }

      if (selectedFormat === "xlsx") {
        const workbook = XLSX.utils.book_new();
        
        dataKeys.forEach(sheetName => {
          const worksheet = XLSX.utils.json_to_sheet(exportData[sheetName]);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        
        const fileName = `relatorio_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } else if (selectedFormat === "csv") {
        // Para CSV, vamos exportar cada tipo de dados como arquivo separado
        dataKeys.forEach(dataType => {
          if (exportData[dataType] && exportData[dataType].length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(exportData[dataType]);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${dataType.toLowerCase()}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
      } else if (selectedFormat === "json") {
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Exportação concluída",
        description: `Relatório exportado com sucesso em formato ${selectedFormat.toUpperCase()}.`
      });

      // Chamar callback do pai
      onExport(selectedFormat, selectedDataTypes);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getTotalRecords = () => {
    const exportData = prepareExportData();
    return Object.values(exportData).reduce((total, dataArray) => total + dataArray.length, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
            Configurações de Exportação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Dados */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              Tipos de Dados
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dataTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedDataTypes.includes(option.id);
                const hasData = option.id === "appointments" 
                  ? data.length > 0 
                  : additionalData[option.label] && additionalData[option.label].length > 0;
                
                return (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : hasData
                        ? 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        : 'border-neutral-200 dark:border-neutral-700 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => hasData && handleDataTypeToggle(option.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        disabled={!hasData}
                        onChange={() => hasData && handleDataTypeToggle(option.id)}
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {hasData ? 
                        `${option.id === "appointments" ? data.length : additionalData[option.label]?.length || 0} registros` : 
                        'Sem dados'
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtro de Data */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              Período dos Dados
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="md:w-64">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dateRange === "custom" && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange.from ? format(customDateRange.from, 'dd/MM/yyyy') : 'Data início'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateRange.from}
                        onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange.to ? format(customDateRange.to, 'dd/MM/yyyy') : 'Data fim'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateRange.to}
                        onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Formato de Exportação */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              Formato de Arquivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => setSelectedFormat(option.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo e Exportação */}
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Resumo da Exportação
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedDataTypes.map((dataType) => {
                  const option = dataTypeOptions.find(opt => opt.id === dataType);
                  return (
                    <Badge key={dataType} variant="secondary">
                      {option?.label}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Total de registros: <strong>{getTotalRecords()}</strong> | 
                Formato: <strong>{selectedFormat.toUpperCase()}</strong>
              </p>
            </div>
            
            <Button
              onClick={handleExport}
              disabled={selectedDataTypes.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportControls;
