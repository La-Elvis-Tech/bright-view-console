
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  availableTimes: string[];
  disabled?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange,
  availableTimes,
  disabled = false
}) => {
  // Validação mais robusta dos horários
  const validTimes = availableTimes
    .filter(time => 
      time && 
      typeof time === 'string' && 
      time.trim() !== '' &&
      time.length >= 4 && // Formato mínimo HH:MM
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time.trim()) // Validar formato HH:MM
    )
    .map(time => time.trim())
    .filter((time, index, array) => array.indexOf(time) === index); // Remove duplicatas

  console.log('TimeSelector - Original times:', availableTimes);
  console.log('TimeSelector - Valid times:', validTimes);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Horário
      </label>
      <Select value={selectedTime} onValueChange={onTimeChange} disabled={disabled || validTimes.length === 0}>
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <SelectValue placeholder="Selecione o horário" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          {validTimes.length > 0 ? (
            validTimes.map((time) => (
              <SelectItem 
                key={`time-${time}`}
                value={time}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {time}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              Nenhum horário disponível
            </div>
          )}
        </SelectContent>
      </Select>
      {disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Selecione um médico e data primeiro
        </p>
      )}
    </div>
  );
};

export default TimeSelector;
