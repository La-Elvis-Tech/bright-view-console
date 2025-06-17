
import React from 'react';
import { format, isSameDay, isToday, isAfter, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupabaseAppointment } from '@/types/appointment';

interface WeeklyCalendarDayProps {
  day: Date;
  appointments: SupabaseAppointment[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onSelectAppointment?: (appointment: SupabaseAppointment) => void;
}

const WeeklyCalendarDay: React.FC<WeeklyCalendarDayProps> = ({
  day,
  appointments,
  selectedDate,
  onSelectDate,
  onSelectAppointment
}) => {
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-red-500 text-white';
      case 'Confirmado': return 'bg-emerald-500 text-white';
      case 'Em andamento': return 'bg-amber-500 text-white';
      case 'Concluído': return 'bg-gray-500 text-white';
      case 'Cancelado': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div
      className={`
        p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[90px] border-2
        ${isSelected 
          ? 'bg-neutral-50 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600 shadow-sm' 
          : 'bg-neutral-25 border-neutral-150 hover:bg-neutral-50 hover:border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800'
        }
        ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
        ${isToday(day) ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
      `}
      onClick={() => !isPast && onSelectDate(day)}
    >
      <div className="text-center mb-0">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
          {format(day, 'EEE', { locale: ptBR })}
        </div>
        <div className={`text-lg font-semibold mt-1 ${
          isToday(day) 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-neutral-900 dark:text-neutral-100'
        }`}>
          {format(day, 'd')}
        </div>
      </div>
      
      <div className="space-y-1">
        {appointments.slice(0, 2).map((appointment) => (
          <div
            key={appointment.id}
            className={`text-xs p-1.5 rounded-lg text-center cursor-pointer transition-all ${getStatusColor(appointment.status)} hover:shadow-sm`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAppointment?.(appointment);
            }}
          >
            <div className="font-medium">
              {format(new Date(appointment.scheduled_date), 'HH:mm')}
            </div>
            <div className="truncate text-xs opacity-90">
              {appointment.patient_name}
            </div>
          </div>
        ))}
        {appointments.length > 2 && (
          <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded-lg py-1">
            +{appointments.length - 2} mais
          </div>
        )}
        {appointments.length === 0 && !isPast && (
          <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-1">
            Disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendarDay;
