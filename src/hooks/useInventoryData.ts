
import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryCategory } from '@/types/inventory';
import { getUserUnit, fetchInventoryItems, fetchInventoryCategories } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

export const useInventoryData = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUnit, setUserUnit] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const loadUserUnit = useCallback(async () => {
    try {
      console.log('Loading user unit...');
      const unit = await getUserUnit();
      console.log('User unit loaded:', unit);
      setUserUnit(unit);
      return unit;
    } catch (error) {
      console.error('Error loading user unit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar informações da unidade do usuário.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const loadItems = useCallback(async (unitId: string) => {
    try {
      console.log('Loading inventory items for unit:', unitId);
      setLoading(true);
      const inventoryItems = await fetchInventoryItems(unitId);
      console.log('Inventory items loaded:', inventoryItems.length, 'items');
      setItems(inventoryItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      console.log('Loading inventory categories...');
      const inventoryCategories = await fetchInventoryCategories();
      console.log('Categories loaded:', inventoryCategories.length, 'categories');
      setCategories(inventoryCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const refreshItems = useCallback(async () => {
    if (userUnit?.id) {
      console.log('Refreshing items for unit:', userUnit.id);
      await loadItems(userUnit.id);
    }
  }, [userUnit?.id, loadItems]);

  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing inventory data...');
      const unit = await loadUserUnit();
      if (unit?.id) {
        console.log('Loading items and categories for unit:', unit.id);
        await Promise.all([
          loadItems(unit.id),
          loadCategories()
        ]);
      } else {
        console.log('No unit found, setting loading to false');
        setLoading(false);
      }
    };

    initializeData();
  }, [loadUserUnit, loadItems, loadCategories]);

  return {
    items,
    categories,
    loading,
    userUnit,
    refreshItems
  };
};
