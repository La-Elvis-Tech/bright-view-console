
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Filter } from 'lucide-react';

interface ReportsHeaderProps {
  selectedUnit: string;
  onUnitChange: (value: string) => void;
  units: Array<{ id: string; name: string; code: string }>;
  showUnitSelector: boolean;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  selectedUnit,
  onUnitChange,
  units,
  showUnitSelector
}) => {
  return (
    <Card className="border-0 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Relatórios do Sistema
            </CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              Análise completa de agendamentos, inventário e performance
            </p>
          </div>
          
          {showUnitSelector && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Filtrar por unidade:
                </span>
              </div>
              <Select value={selectedUnit} onValueChange={onUnitChange}>
                <SelectTrigger className="min-w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Selecionar unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Minha Unidade</SelectItem>
                  <SelectItem value="all">Todas as Unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {unit.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      {selectedUnit !== "default" && selectedUnit !== "all" && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Exibindo dados de: 
            </span>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
              {selectedUnit === "all" ? "Todas as Unidades" : 
               units.find(u => u.id === selectedUnit)?.name || "Unidade Selecionada"}
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ReportsHeader;
