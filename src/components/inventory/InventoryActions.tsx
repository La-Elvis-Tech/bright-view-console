import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash, Calendar, Download } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface InventoryActionsProps {
  item: InventoryItem;
  categories: InventoryCategory[];
  onUpdate: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReserve?: (item: InventoryItem) => void;
}

const InventoryActions: React.FC<InventoryActionsProps> = ({
  item,
  categories,
  onUpdate,
  onDelete,
  onReserve
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [reserveReason, setReserveReason] = useState('');
  const { toast } = useToast();

  const [editData, setEditData] = useState({
    name: item.name,
    description: item.description || '',
    category_id: item.category_id,
    current_stock: item.current_stock,
    min_stock: item.min_stock,
    max_stock: item.max_stock,
    unit: item.unit,
    cost_per_unit: item.cost_per_unit || 0,
    supplier: item.supplier || '',
    location: item.location || '',
    expiry_date: item.expiry_date || '',
    lot_number: item.lot_number || ''
  });

  const handleEdit = async () => {
    try {
      await onUpdate(item.id, editData);
      toast({
        title: 'Item atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
      setEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(item.id);
      toast({
        title: 'Item excluído',
        description: 'O item foi removido do inventário.',
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item.',
        variant: 'destructive',
      });
    }
  };

  const handleReserve = () => {
    if (reserveQuantity > item.current_stock) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade a reservar não pode ser maior que o estoque disponível.',
        variant: 'destructive',
      });
      return;
    }

    // Simular reserva (em um sistema real, isso criaria um registro de reserva)
    const newStock = item.current_stock - reserveQuantity;
    onUpdate(item.id, { current_stock: newStock }).then(() => {
      toast({
        title: 'Item reservado',
        description: `${reserveQuantity} ${item.unit} de "${item.name}" foram reservados.`,
      });
      setReserveDialogOpen(false);
      setReserveQuantity(1);
      setReserveReason('');
    });
  };

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select 
                  value={editData.category_id} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Estoque Atual</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editData.current_stock}
                  onChange={(e) => setEditData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-min-stock">Estoque Mínimo</Label>
                <Input
                  id="edit-min-stock"
                  type="number"
                  min="0"
                  value={editData.min_stock}
                  onChange={(e) => setEditData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unidade</Label>
                <Input
                  id="edit-unit"
                  value={editData.unit}
                  onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Custo por Unidade</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editData.cost_per_unit}
                  onChange={(e) => setEditData(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Fornecedor</Label>
                <Input
                  id="edit-supplier"
                  value={editData.supplier}
                  onChange={(e) => setEditData(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reserve Dialog */}
      <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item: {item.name}</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Estoque disponível: {item.current_stock} {item.unit}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reserve-quantity">Quantidade a Reservar</Label>
              <Input
                id="reserve-quantity"
                type="number"
                min="1"
                max={item.current_stock}
                value={reserveQuantity}
                onChange={(e) => setReserveQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserve-reason">Motivo da Reserva</Label>
              <Textarea
                id="reserve-reason"
                value={reserveReason}
                onChange={(e) => setReserveReason(e.target.value)}
                placeholder="Ex: Exame agendado, manutenção preventiva..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setReserveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReserve} className="bg-orange-600 hover:bg-orange-700">
                <Calendar className="h-4 w-4 mr-2" />
                Reservar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{item.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditDialogOpen(true)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReserveDialogOpen(true)}
          className="h-8 w-8 p-0"
        >
          <Calendar className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default InventoryActions;