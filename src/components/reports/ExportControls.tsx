
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToJSON, exportToExcel, exportMultipleSheets } from '@/utils/exportUtils';

interface ExportControlsProps {
  data: any[];
  reportType: string;
  onExport?: (format: string, dataTypes: string[]) => void;
  additionalData?: { [key: string]: any[] };
}

const ExportControls: React.FC<ExportControlsProps> = ({ 
  data, 
  reportType, 
  onExport,
  additionalData = {} 
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('excel');
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // If onExport prop is provided, use it (for custom export logic)
      if (onExport) {
        onExport(format, []);
        return;
      }

      // Default export logic
      const filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(data, filename);
      } else if (format === 'json') {
        exportToJSON(data, filename);
      } else if (format === 'excel') {
        // If we have additional data, create multiple sheets
        if (Object.keys(additionalData).length > 0) {
          const sheets = [
            { data, name: 'Dados Principais' },
            ...Object.entries(additionalData).map(([key, sheetData]) => ({
              data: sheetData,
              name: key
            }))
          ];
          exportMultipleSheets(sheets, filename);
        } else {
          exportToExcel(data, filename);
        }
      }

      toast({
        title: 'Relatório exportado',
        description: `Dados exportados em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Formato:</span>
        <Select value={format} onValueChange={(value: 'csv' | 'json' | 'excel') => setFormat(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CSV
              </div>
            </SelectItem>
            <SelectItem value="json">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                JSON
              </div>
            </SelectItem>
            <SelectItem value="excel">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={handleExport} disabled={!data || data.length === 0}>
        <Download className="w-4 h-4 mr-2" />
        Exportar Relatório
      </Button>
    </div>
  );
};

export default ExportControls;
