
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

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
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['appointments']);
  const [dateRange, setDateRange] = useState('thisMonth');

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-500' },
    { value: 'excel', label: 'Excel', icon: Table, color: 'text-green-500' },
    { value: 'csv', label: 'CSV', icon: BarChart3, color: 'text-blue-500' }
  ];

  const dataTypeOptions = [
    { id: 'appointments', label: 'Agendamentos', count: data.length },
    { id: 'inventory', label: 'Inventário', count: additionalData['Inventário']?.length || 0 },
    { id: 'movements', label: 'Movimentações', count: additionalData['Movimentações']?.length || 0 },
    { id: 'alerts', label: 'Alertas', count: additionalData['Alertas']?.length || 0 }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'thisWeek', label: 'Esta Semana' },
    { value: 'thisMonth', label: 'Este Mês' },
    { value: 'lastMonth', label: 'Mês Passado' },
    { value: 'thisYear', label: 'Este Ano' },
    { value: 'custom', label: 'Período Customizado' }
  ];

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes([...selectedDataTypes, dataType]);
    } else {
      setSelectedDataTypes(selectedDataTypes.filter(type => type !== dataType));
    }
  };

  const handleExport = () => {
    onExport(selectedFormat, selectedDataTypes);
  };

  const getSelectedFormat = () => {
    return formatOptions.find(f => f.value === selectedFormat);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Exportar Relatórios
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Configure e exporte relatórios personalizados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Download className="h-4 w-4 text-neutral-500" />
              Configurações de Exportação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Formato do Arquivo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedFormat === format.value
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <format.icon className={`h-4 w-4 ${format.color}`} />
                      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {format.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Types */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Dados para Exportar
              </label>
              <div className="space-y-3">
                {dataTypeOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={option.id}
                        checked={selectedDataTypes.includes(option.id)}
                        onCheckedChange={(checked) => 
                          handleDataTypeChange(option.id, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={option.id}
                        className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {option.label}
                      </label>
                    </div>
                    <Badge className="text-xs bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                      {option.count} registros
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Preview */}
        <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Pré-visualização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Summary */}
            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Formato:</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedFormatObj = getSelectedFormat();
                      if (!selectedFormatObj) return null;
                      const Icon = selectedFormatObj.icon;
                      return (
                        <>
                          <Icon className={`h-4 w-4 ${selectedFormatObj.color}`} />
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {selectedFormatObj.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Período:</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {dateRangeOptions.find(d => d.value === dateRange)?.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Datasets:</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {selectedDataTypes.length} selecionados
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Data Types */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Dados Incluídos:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDataTypes.map((type) => {
                  const option = dataTypeOptions.find(o => o.id === type);
                  return option ? (
                    <Badge 
                      key={type}
                      className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800"
                    >
                      {option.label} ({option.count})
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* Export Button */}
            <Button 
              onClick={handleExport}
              disabled={selectedDataTypes.length === 0}
              className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportControls;
