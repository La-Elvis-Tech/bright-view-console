
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
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Horário
      </label>
      <Select value={selectedTime} onValueChange={onTimeChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <SelectValue placeholder="Selecione o horário" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          {availableTimes.map((time) => (
            <SelectItem 
              key={time} 
              value={time}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelector;
