
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryAddItemDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  categories: any[];
  onAddItem: (item: any) => void;
}

const InventoryAddItemDialog: React.FC<InventoryAddItemDialogProps> = ({
  isOpen,
  setIsOpen,
  categories,
  onAddItem,
}) => {
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    unit: "",
    location: "",
    size: "",
    expiryDate: "",
    minStock: "",
    maxStock: "",
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.stock || !newItem.unit || !newItem.location) {
      return;
    }

    const itemToAdd = {
      ...newItem,
      stock: parseInt(newItem.stock),
      minStock: parseInt(newItem.minStock) || 0,
      maxStock: parseInt(newItem.maxStock) || parseInt(newItem.stock) * 3,
      status: parseInt(newItem.stock) <= (parseInt(newItem.minStock) || 0) ? "low" : "ok",
      lastUsed: new Date().toISOString().split('T')[0],
      reservedForAppointments: 0,
      consumptionHistory: [parseInt(newItem.stock)],
    };

    onAddItem(itemToAdd);

    // Reset form
    setNewItem({
      name: "",
      category: "",
      stock: "",
      unit: "",
      location: "",
      size: "",
      expiryDate: "",
      minStock: "",
      maxStock: "",
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 whitespace-nowrap bg-neutral-950/90 dark:bg-gray-100/90 flex-shrink-0">
          <Plus size={18} />
          <span className="text-sm sm:text-base text-gray-200 dark:text-gray-800">Novo Item</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-none max-w-[95vw] sm:max-w-md md:max-w-lg rounded-lg bg-white dark:bg-neutral-950 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-none pb-3">
          <DialogTitle className="text-xl">
            Adicionar Novo Item
          </DialogTitle>
          <DialogDescription className="pt-1">
            Preencha as informações do novo item de inventário
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 px-2">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Nome *
            </Label>
            <Input
              id="name"
              value={newItem.name}
              placeholder="ex: Ácido Sulfúrico"
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="font-medium">
              Categoria *
            </Label>
            <Select
              value={newItem.category}
              onValueChange={(value) => setNewItem({ ...newItem, category: value })}
            >
              <SelectTrigger className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="py-2">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estoque, Unidade e Localização */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="font-medium">
                Quantidade *
              </Label>
              <Input
                id="stock"
                type="number"
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
                placeholder="ex: 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="font-medium">
                Unidade *
              </Label>
              <Select
                value={newItem.unit}
                onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
              >
                <SelectTrigger className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Litros">Litros</SelectItem>
                  <SelectItem value="Unidades">Unidades</SelectItem>
                  <SelectItem value="Pares">Pares</SelectItem>
                  <SelectItem value="Gramas">Gramas</SelectItem>
                  <SelectItem value="Quilogramas">Quilogramas</SelectItem>
                  <SelectItem value="Mililitros">Mililitros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location" className="font-medium">
              Localização *
            </Label>
            <Input
              id="location"
              value={newItem.location}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
              placeholder="ex: Armário A1, Sala B2"
            />
          </div>

          {/* Níveis Min/Max */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock" className="font-medium">
                Estoque Mínimo
              </Label>
              <Input
                id="minStock"
                type="number"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
                placeholder="ex: 5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock" className="font-medium">
                Estoque Máximo
              </Label>
              <Input
                id="maxStock"
                type="number"
                value={newItem.maxStock}
                onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
                placeholder="ex: 50"
              />
            </div>
          </div>

          {/* Tamanho e Validade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size" className="font-medium">
                Tamanho
              </Label>
              <Input
                id="size"
                value={newItem.size}
                onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
                placeholder="ex: 500ml, 10cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry" className="font-medium">
                Validade
              </Label>
              <Input
                id="expiry"
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="w-full bg-gray-200 dark:bg-neutral-800 dark:border-transparent py-2 px-3"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t-2 pt-5">
          <Button
            type="submit"
            onClick={handleAddItem}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90"
          >
            Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryAddItemDialog;
