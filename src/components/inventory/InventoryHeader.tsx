
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Download } from 'lucide-react';
import InventoryForm from './InventoryForm';
import { InventoryCategory } from '@/types/inventory';

interface InventoryHeaderProps {
  unitName: string;
  categories: InventoryCategory[];
  onAddSuccess: () => void;
  onExport: () => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  showExportDialog: boolean;
  setShowExportDialog: (show: boolean) => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  unitName,
  categories,
  onAddSuccess,
  onExport,
  showAddDialog,
  setShowAddDialog,
  showExportDialog,
  setShowExportDialog
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-500" />
          Inventário - {unitName}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Gerencie o estoque de materiais e reagentes
        </p>
      </div>
      <div className="flex gap-2">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-lab-blue hover:bg-lab-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo item a ser adicionado ao inventário.
              </DialogDescription>
            </DialogHeader>
            <InventoryForm onSuccess={onAddSuccess} categories={categories} />
          </DialogContent>
        </Dialog>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exportar Inventário</DialogTitle>
              <DialogDescription>
                Escolha o formato para exportar os dados do inventário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button onClick={onExport} className="w-full">
                Exportar como CSV
              </Button>
              <Button onClick={onExport} className="w-full">
                Exportar como Excel
              </Button>
              <Button onClick={onExport} className="w-full">
                Exportar como PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InventoryHeader;
