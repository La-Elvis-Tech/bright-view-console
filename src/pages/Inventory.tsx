import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useToast } from '@/hooks/use-toast';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryStockHealth from '@/components/inventory/InventoryStockHealth';
import { SkeletonInventory } from '@/components/ui/skeleton-inventory';
import { useAuthContext } from '@/context/AuthContext';
import { InventoryItem } from '@/types/inventory';

const Inventory = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { profile } = useAuthContext();

  const {
    items: inventoryItems,
    categories,
    loading,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    deleteItem: deleteInventoryItem,
    refreshItems
  } = useSupabaseInventory();

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category_id: '',
    current_stock: 0,
    min_stock: 0,
    max_stock: 100,
    unit_measure: '',
    cost_per_unit: 0,
    supplier: '',
    sku: '',
    storage_location: '',
    expiry_date: '',
    lot_number: ''
  });

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      category_id: '',
      current_stock: 0,
      min_stock: 0,
      max_stock: 100,
      unit_measure: '',
      cost_per_unit: 0,
      supplier: '',
      sku: '',
      storage_location: '',
      expiry_date: '',
      lot_number: ''
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...newItem,
        unit: newItem.unit_measure, // Map unit_measure to unit
        unit_id: profile?.unit_id || '', // Add unit_id from user profile
        active: true, // Add active field
        expiry_date: newItem.expiry_date || null
      };
      
      await addInventoryItem(itemData);
      
      toast({
        title: 'Item adicionado',
        description: 'O item foi adicionado ao inventário com sucesso.',
      });
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item ao inventário.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleUpdateSuccess = () => {
    // Refresh the items after successful update
    refreshItems();
  };

  const handleLowStockAlert = (item: InventoryItem) => {
    toast({
      title: 'Estoque Baixo',
      description: `O item "${item.name}" está com estoque baixo (${item.current_stock} unidades).`,
      variant: 'destructive',
    });
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.current_stock <= item.min_stock;
    } else if (stockFilter === 'normal') {
      matchesStock = item.current_stock > item.min_stock;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return <SkeletonInventory />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Inventário
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie o estoque de materiais e suprimentos do laboratório
        </p>
      </div>

      <InventoryStats items={inventoryItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
        <div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do item"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select 
                      value={newItem.category_id} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(category => category.id).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do item"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_stock">Estoque Atual *</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      value={newItem.current_stock}
                      onChange={(e) => setNewItem(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_measure">Unidade de Medida *</Label>
                    <Input
                      id="unit_measure"
                      value={newItem.unit_measure}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit_measure: e.target.value }))}
                      placeholder="Ex: mL, Kg, Unidade"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Estoque Mínimo *</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      min="0"
                      value={newItem.min_stock}
                      onChange={(e) => setNewItem(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost_per_unit">Custo por Unidade *</Label>
                    <Input
                      id="cost_per_unit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.cost_per_unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={newItem.sku}
                      onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Código SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage_location">Local de Armazenamento</Label>
                    <Input
                      id="storage_location"
                      value={newItem.storage_location}
                      onChange={(e) => setNewItem(prev => ({ ...prev, storage_location: e.target.value }))}
                      placeholder="Ex: Prateleira A, Geladeira"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot_number">Número do Lote</Label>
                  <Input
                    id="lot_number"
                    value={newItem.lot_number}
                    onChange={(e) => setNewItem(prev => ({ ...prev, lot_number: e.target.value }))}
                    placeholder="Número do lote"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/*<InventoryStockHealth 
        items={inventoryItems} 
        expiringItems={inventoryItems.filter(item => {
          if (!item.expiry_date) return false;
          const expiryDate = new Date(item.expiry_date);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return expiryDate <= thirtyDaysFromNow;
        })} 
      />*/}

      <InventoryTable
        items={filteredItems}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onUpdateItem={updateInventoryItem}
        onDeleteItem={deleteInventoryItem}
        onUpdateSuccess={handleUpdateSuccess}
        onLowStockAlert={handleLowStockAlert}
      />
    </div>
  );
};

export default Inventory;
