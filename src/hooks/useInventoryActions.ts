
import { useCallback } from 'react';
import { InventoryItem } from '@/types/inventory';
import { createInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryMovement } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

export const useInventoryActions = (userUnit: { id: string; name: string } | null, refreshItems: () => Promise<void>) => {
  const { toast } = useToast();

  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userUnit?.id) {
      toast({
        title: 'Erro',
        description: 'Unidade do usuário não encontrada.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createInventoryItem(item, userUnit.id);
      
      await addInventoryMovement({
        item_id: '',
        movement_type: 'in',
        quantity: item.current_stock,
        unit_cost: item.cost_per_unit || 0,
        total_cost: (item.current_stock * (item.cost_per_unit || 0)),
        reason: 'Adição inicial de item ao inventário',
        reference_type: 'manual',
        performed_by: ''
      });

      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item adicionado ao inventário com sucesso.',
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item ao inventário.',
        variant: 'destructive',
      });
    }
  }, [userUnit?.id, refreshItems, toast]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateInventoryItem(id, updates);
      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
    }
  }, [refreshItems, toast]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteInventoryItem(id);
      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item removido do inventário.',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o item.',
        variant: 'destructive',
      });
    }
  }, [refreshItems, toast]);

  return {
    addItem,
    updateItem,
    deleteItem
  };
};
