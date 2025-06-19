
import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight, Filter, Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeeklyCalendarHeaderProps {
  currentWeek: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  units?: Array<{ id: string; name: string; code: string }>;
  selectedUnitFilter?: string;
  onUnitFilterChange?: (unitId: string) => void;
  showUnitFilter?: boolean;
}

const WeeklyCalendarHeader: React.FC<WeeklyCalendarHeaderProps> = ({
  currentWeek,
  onNavigateWeek,
  units = [],
  selectedUnitFilter,
  onUnitFilterChange,
  showUnitFilter = false
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  return (
    <div className="space-y-4">
      {/* Cabeçalho principal melhorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Calendário Semanal
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Selecione uma data para ver horários disponíveis
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg p-1 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateWeek('prev')}
            className="h-9 w-9 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="px-3 py-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[160px] text-center bg-neutral-50 dark:bg-neutral-700 rounded">
            {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateWeek('next')}
            className="h-9 w-9 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtro de Unidades melhorado */}
      {showUnitFilter && units.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Filtros de Visualização
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Selecione uma unidade para filtrar médicos e agendamentos
            </p>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Unidade:
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <Select value={selectedUnitFilter || 'todas'} onValueChange={onUnitFilterChange}>
                  <SelectTrigger className="w-full sm:w-[250px] h-9 text-sm border-neutral-300 dark:border-neutral-600">
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        <span className="font-medium">Todas as unidades</span>
                      </div>
                    </SelectItem>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{unit.name}</span>
                          <span className="text-xs text-neutral-500">({unit.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedUnitFilter && selectedUnitFilter !== 'todas' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnitFilterChange?.('todas')}
                    className="h-8 px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Limpar filtro
                  </Button>
                )}
              </div>
            </div>
            
            {/* Indicador de filtro ativo */}
            {selectedUnitFilter && selectedUnitFilter !== 'todas' && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Filtrando por: {units.find(u => u.id === selectedUnitFilter)?.name || 'Unidade selecionada'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarHeader;
