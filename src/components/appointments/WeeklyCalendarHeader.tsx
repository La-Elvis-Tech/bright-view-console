
import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarHeaderProps {
  currentWeek: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

const WeeklyCalendarHeader: React.FC<WeeklyCalendarHeaderProps> = ({
  currentWeek,
  onNavigateWeek
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  return (
    <div className="flex items-center justify-between">
      <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg hidden md:inline">
          <CalendarIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 hidden md:inline" />
        </div>
        <div className="pr-2">
          <div className="text-base">Calendário Semanal</div>
          <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
            Selecione uma data para ver horários disponíveis
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateWeek('prev')}
          className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-xs md:text-sm font-medium sm:-mx-4 md:px-0 xl:px-4 text-neutral-700 dark:text-neutral-300 min-w-[140px] text-center">
          {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateWeek('next')}
          className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WeeklyCalendarHeader;
