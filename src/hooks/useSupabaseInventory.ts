
import { useInventoryData } from './useInventoryData';
import { useInventoryActions } from './useInventoryActions';

export const useSupabaseInventory = () => {
  const { items, categories, loading, userUnit, refreshItems } = useInventoryData();
  const { addItem, updateItem, deleteItem } = useInventoryActions(userUnit, refreshItems);

  // Calcular itens com estoque crítico (incluindo reservas)
  const getCriticalStockItems = () => {
    return items.filter(item => {
      const availableStock = item.current_stock; // Aqui poderia incluir cálculo de reservas
      return availableStock <= item.min_stock;
    });
  };

  // Calcular valor total do inventário
  const getTotalInventoryValue = () => {
    return items.reduce((total, item) => {
      return total + (item.current_stock * (item.cost_per_unit || 0));
    }, 0);
  };

  // Obter estatísticas do inventário
  const getInventoryStats = () => {
    const totalItems = items.length;
    const criticalItems = getCriticalStockItems().length;
    const totalValue = getTotalInventoryValue();
    const categoriesCount = new Set(items.map(item => item.category_id)).size;

    return {
      totalItems,
      criticalItems,
      totalValue,
      categoriesCount,
      criticalPercentage: totalItems > 0 ? (criticalItems / totalItems) * 100 : 0
    };
  };

  return {
    items,
    categories,
    loading,
    userUnit,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
    getCriticalStockItems,
    getTotalInventoryValue,
    getInventoryStats
  };
};
