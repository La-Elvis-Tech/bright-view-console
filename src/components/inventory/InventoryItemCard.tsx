import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Package,
  Database,
  Clock,
  Edit2,
  PackagePlus,
  Archive ,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
  Info,
  Minus,
  PackageMinus,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  expiryDate?: string;
  lastUsed: string;
  consumptionHistory?: number[];
  reservedForAppointments: number;
  size?: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onUpdateItem: (itemId: number, updatedData: Partial<InventoryItem>) => void;
  onReserveItem: (itemId: number, quantity: number) => void;
  onRequestRestock: (itemId: number) => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onUpdateItem,
  onReserveItem,
  onRequestRestock,
}) => {
  const [isEditing, setIsEditing] = useState({
    stock: false,
    expiryDate: false,
  });
  const [editValues, setEditValues] = useState({
    stock: item.stock,
    expiryDate: item.expiryDate,
  });
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [stockOutQuantity, setStockOutQuantity] = useState(1);

  const getStockLevel = () => {
    if (item.stock <= item.minStock) return "low";
    if (item.stock >= item.maxStock) return "high";
    return "normal";
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "border-l-red-400";
      case "high":
        return "border-l-amber-400";
      default:
        return "border-l-emerald-400";
    }
  };

  const isExpiringSoon = () => {
    if (!item.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  const getDaysUntilExpiry = () => {
    if (!item.expiryDate) return null;
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const handleSaveEdit = (field: string) => {
    onUpdateItem(item.id, { [field]: editValues[field] });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleCancelEdit = (field: string) => {
    setEditValues({ ...editValues, [field]: item[field] });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleStockOut = (quantity: number) => {
    const newStock = Math.max(0, item.stock - quantity);
    onUpdateItem(item.id, { stock: newStock });
  };

  const stockLevel = getStockLevel();
  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Card
      className={`inventory-item group overflow-hidden h-full transition-all duration-300 hover:shadow-lg border-l-4 ${getStockLevelColor(
        stockLevel
      )} bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800`}
    >
      

      <CardContent className="p-4 pt-0 flex flex-col h-full">
        {/* Título e estoque */}
        <div className="my-4">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 leading-tight">
            {item.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
              {item.category.replace("_", " ")}
            </span>

            {/* Edição inline do estoque */}
            <div className="flex items-center gap-2">
              {isEditing.stock ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editValues.stock}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className="w-16 h-7 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit("stock")}
                    className="h-6 w-6 p-0 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Save size={10} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelEdit("stock")}
                    className="h-6 w-6 p-0"
                  >
                    <X size={10} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {item.stock} {item.unit}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing({ ...isEditing, stock: true })}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={10} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de progresso simplificada */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-400 mb-2">
            <span>{item.minStock}</span>
            <span>{item.maxStock}</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stockLevel === "low"
                  ? "bg-red-400"
                  : stockLevel === "high"
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(5, (item.stock / item.maxStock) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Informações básicas */}
        <div className="space-y-3 text-sm flex-grow">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 dark:text-neutral-400">
              Localização
            </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300 text-right">
              {item.location}
            </span>
          </div>

          {item.expiryDate && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">
                Validade
              </span>
              {isEditing.expiryDate ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={editValues.expiryDate}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        expiryDate: e.target.value,
                      })
                    }
                    className="h-6 text-xs w-32"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit("expiryDate")}
                    className="h-6 w-6 p-0 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Save size={8} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {new Date(item.expiryDate).toLocaleDateString("pt-BR")}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setIsEditing({ ...isEditing, expiryDate: true })
                    }
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={8} />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-neutral-500 dark:text-neutral-400">
              Último uso
            </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {new Date(item.lastUsed).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Gráfico de consumo minimalista */}
        {item.consumptionHistory && (
          <div className="mt-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-500">Tendência</span>
            </div>
            <div className="flex items-end gap-0.5 h-6">
              {item.consumptionHistory.map((value, index) => (
                <div
                  key={index}
                  className="bg-neutral-300 dark:bg-neutral-600 rounded-t-sm flex-1 transition-all hover:bg-neutral-400 dark:hover:bg-neutral-500"
                  style={{
                    height: `${
                      (value / Math.max(...item.consumptionHistory)) * 100
                    }%`,
                    minHeight: "2px",
                  }}
                  title={`${value} ${item.unit}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-xs h-8 bg-blue-500 hover:bg-neutral-600 text-white"
              >
                <Archive  size={12} className="mr-1" />
                Reservar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg h-auto bg-white dark:bg-neutral-900">
              <DialogHeader>
                <DialogTitle>Reservar Item</DialogTitle>
                <DialogDescription>
                  Reservar {item.name} para um agendamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={reserveQuantity}
                    onChange={(e) =>
                      setReserveQuantity(parseInt(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => onReserveItem(item.id, reserveQuantity)}>
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          

          <Button
            onClick={() => onRequestRestock(item.id)}
            size="sm"
            className="text-xs h-8 bg-green-500 hover:bg-neutral-600 text-white"
          >
            <PackagePlus size={12} className="mr-1" />
            Repor
          </Button>
        </div>
        {/* Ação de esgotamento */}
        <div className="mt-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-xs w-full bg-red-500 hover:bg-neutral-600 text-white"
              >
                <PackageMinus size={12} className="mr-1" />
                Baixa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-neutral-900">
              <DialogHeader>
                <DialogTitle>Registrar Baixa</DialogTitle>
                <DialogDescription>
                  Dar baixa no estoque de {item.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={stockOutQuantity}
                    onChange={(e) =>
                      setStockOutQuantity(parseInt(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleStockOut(stockOutQuantity)}>
                  Confirmar Baixa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* HoverCard para detalhes */}
        <div className="mt-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs"
              >
                <Info size={12} className="mr-2" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border-0 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <Info size={16} />
                  {item.name}
                </DialogTitle>
                <DialogDescription className="text-neutral-500 dark:text-neutral-400">
                  Análise detalhada do item
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Conteúdo do detalhamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {item.stock - item.reservedForAppointments}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      Disponível
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {item.reservedForAppointments}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Reservado
                    </div>
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Consumo médio/mês
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        item.consumptionHistory?.reduce((a, b) => a + b, 0) /
                          item.consumptionHistory?.length || 0
                      )}{" "}
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Status
                    </span>
                    <Badge
                      className={
                        stockLevel === "low"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : stockLevel === "high"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }
                    >
                      {stockLevel === "low"
                        ? "Baixo"
                        : stockLevel === "high"
                        ? "Excesso"
                        : "Normal"}
                    </Badge>
                  </div>

                  {item.size && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Tamanho
                      </span>
                      <span className="font-medium">{item.size}</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryItemCard;
