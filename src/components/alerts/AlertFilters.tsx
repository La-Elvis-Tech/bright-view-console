
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, EyeOff } from "lucide-react";

interface AlertFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  showUnreadOnly: boolean;
  setShowUnreadOnly: (show: boolean) => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  showUnreadOnly,
  setShowUnreadOnly,
  unreadCount,
  onMarkAllAsRead
}) => {
  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Linha 1: Busca e contador */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Buscar alertas, itens ou descrições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-neutral-300 dark:border-neutral-600"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {unreadCount} não lidas
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onMarkAllAsRead}
                    className="text-xs border-neutral-300 dark:border-neutral-600"
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Linha 2: Filtros */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2">
              Filtros:
            </span>
            
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="h-8 text-xs border-neutral-300 dark:border-neutral-600"
            >
              {showUnreadOnly ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
              {showUnreadOnly ? "Mostrar todas" : "Só não lidas"}
            </Button>

            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600 mx-1" />

            <Button
              variant={filterPriority === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("all")}
              className="h-8 text-xs border-neutral-300 dark:border-neutral-600"
            >
              Todas
            </Button>
            <Button
              variant={filterPriority === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("critical")}
              className="h-8 text-xs text-red-600 border-neutral-300 dark:border-neutral-600"
            >
              Crítico
            </Button>
            <Button
              variant={filterPriority === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("high")}
              className="h-8 text-xs text-orange-600 border-neutral-300 dark:border-neutral-600"
            >
              Alto
            </Button>
            <Button
              variant={filterPriority === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("medium")}
              className="h-8 text-xs text-yellow-600 border-neutral-300 dark:border-neutral-600"
            >
              Médio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
