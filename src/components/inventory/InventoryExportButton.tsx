import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface InventoryExportButtonProps {
  items: InventoryItem[];
  selectedItems?: Set<string>;
}

const InventoryExportButton: React.FC<InventoryExportButtonProps> = ({
  items,
  selectedItems
}) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      // Filtrar itens selecionados se houver seleção, senão exportar todos
      const itemsToExport = selectedItems && selectedItems.size > 0 
        ? items.filter(item => selectedItems.has(item.id))
        : items;

      if (itemsToExport.length === 0) {
        toast({
          title: 'Nenhum item para exportar',
          description: 'Selecione pelo menos um item ou verifique se há dados disponíveis.',
          variant: 'destructive',
        });
        return;
      }

      // Preparar dados para exportação
      const exportData = itemsToExport.map(item => ({
        'Nome': item.name,
        'Descrição': item.description || '',
        'Categoria': item.categories?.name || 'Sem categoria',
        'Estoque Atual': item.current_stock,
        'Estoque Mínimo': item.min_stock,
        'Estoque Máximo': item.max_stock,
        'Unidade': item.unit,
        'Custo por Unidade': item.cost_per_unit ? `R$ ${item.cost_per_unit.toFixed(2)}` : 'R$ 0,00',
        'Valor Total': item.cost_per_unit ? `R$ ${(item.current_stock * item.cost_per_unit).toFixed(2)}` : 'R$ 0,00',
        'Fornecedor': item.supplier || '',
        'Localização': item.location || '',
        'Data de Validade': item.expiry_date || '',
        'Número do Lote': item.lot_number || '',
        'Status': item.current_stock <= 0 ? 'Sem Estoque' :
                 item.current_stock <= item.min_stock ? 'Crítico' :
                 item.current_stock <= item.min_stock * 1.5 ? 'Baixo' : 'Normal',
        'Criado em': new Date(item.created_at).toLocaleDateString('pt-BR'),
        'Atualizado em': new Date(item.updated_at).toLocaleDateString('pt-BR')
      }));

      // Criar planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      // Adicionar planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');

      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 20 }, // Nome
        { wch: 30 }, // Descrição
        { wch: 15 }, // Categoria
        { wch: 12 }, // Estoque Atual
        { wch: 12 }, // Estoque Mínimo
        { wch: 12 }, // Estoque Máximo
        { wch: 10 }, // Unidade
        { wch: 15 }, // Custo por Unidade
        { wch: 15 }, // Valor Total
        { wch: 20 }, // Fornecedor
        { wch: 15 }, // Localização
        { wch: 15 }, // Data de Validade
        { wch: 15 }, // Número do Lote
        { wch: 10 }, // Status
        { wch: 12 }, // Criado em
        { wch: 12 }  // Atualizado em
      ];
      worksheet['!cols'] = columnWidths;

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `inventario_${timestamp}.xlsx`;

      // Fazer download
      XLSX.writeFile(workbook, filename);

      toast({
        title: 'Exportação concluída',
        description: `${itemsToExport.length} itens foram exportados para ${filename}`,
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={exportToExcel}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Exportar Excel
      {selectedItems && selectedItems.size > 0 && (
        <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
          {selectedItems.size}
        </span>
      )}
    </Button>
  );
};

export default InventoryExportButton;