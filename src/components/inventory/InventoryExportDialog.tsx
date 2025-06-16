
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

interface InventoryExportDialogProps {
  data: any[];
  trigger?: React.ReactNode;
}

const InventoryExportDialog: React.FC<InventoryExportDialogProps> = ({ data, trigger }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const filename = `inventario_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToJSON(data, filename);
      }

      toast({
        title: 'Exportação realizada',
        description: `Dados exportados em formato ${format.toUpperCase()}`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Inventário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Formato de exportação</label>
            <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryExportDialog;
