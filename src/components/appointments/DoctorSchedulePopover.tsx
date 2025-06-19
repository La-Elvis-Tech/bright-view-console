
import React, { useState } from 'react';
import { format, isSameDay, isAfter, startOfToday, isToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Calendar, X } from 'lucide-react';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';

interface DoctorSchedulePopoverProps {
  doctor: Doctor;
  day: Date;
  appointments: SupabaseAppointment[];
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const DoctorSchedulePopover: React.FC<DoctorSchedulePopoverProps> = ({
  doctor,
  day,
  appointments,
  onSelectSlot
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);
  const isWeekend = getDay(day) === 0 || getDay(day) === 6;

  // Horários disponíveis baseados no dia da semana
  const getAvailableHours = () => {
    if (isWeekend) {
      return [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'
      ];
    } else {
      return [
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
    }
  };

  const availableHours = getAvailableHours();

  const getDoctorAppointments = () => {
    return appointments.filter(appointment => 
      appointment.doctor_id === doctor.id && isSameDay(new Date(appointment.scheduled_date), day)
    );
  };

  const isTimeSlotTaken = (time: string) => {
    const doctorAppts = getDoctorAppointments();
    return doctorAppts.some(appt => {
      const apptTime = format(new Date(appt.scheduled_date), 'HH:mm');
      return apptTime === time;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': 
      case 'Confirmado': 
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
      case 'Em andamento': 
        return 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600';
      case 'Concluído': 
        return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'Cancelado': 
        return 'bg-gray-400 hover:bg-gray-500 text-white border-gray-500';
      default: 
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
    }
  };

  const handleTimeSlotClick = (time: string) => {
    if (isPast || isTimeSlotTaken(time)) return;

    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(day);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));

    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId: doctor.id,
      doctorName: doctor.name
    });

    setIsOpen(false);
  };

  const doctorAppts = getDoctorAppointments();
  const availableSlots = availableHours.filter(time => !isTimeSlotTaken(time) && !isPast).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full h-auto p-3 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          disabled={isPast}
        >
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate w-full">
              {doctor.name}
            </div>
            {doctor.specialty && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full">
                {doctor.specialty}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
              <Clock className="h-3 w-3" />
              <span>{availableSlots} disponível{availableSlots !== 1 ? 'eis' : ''}</span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {doctor.name}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Horários */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {availableHours.map((time) => {
                const isTaken = isTimeSlotTaken(time);
                const appointment = doctorAppts.find(appt => 
                  format(new Date(appt.scheduled_date), 'HH:mm') === time
                );
                
                if (isTaken && appointment) {
                  return (
                    <div
                      key={time}
                      className={`text-xs p-2 rounded border cursor-not-allowed ${getStatusColor(appointment.status)}`}
                      title={`${appointment.patient_name} - ${appointment.exam_types?.name || 'Exame'}`}
                    >
                      <div className="font-semibold text-center">{time}</div>
                      <div className="truncate text-xs opacity-90 text-center mt-1">
                        {appointment.patient_name}
                      </div>
                    </div>
                  );
                } else if (!isPast) {
                  return (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      className="h-12 text-xs border-neutral-300 dark:border-neutral-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all"
                      onClick={() => handleTimeSlotClick(time)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="font-medium">{time}</div>
                        <div className="text-xs opacity-75">Livre</div>
                      </div>
                    </Button>
                  );
                } else {
                  return (
                    <div
                      key={time}
                      className="h-12 text-xs p-2 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex flex-col items-center justify-center"
                    >
                      <div>{time}</div>
                      <div className="text-xs opacity-75">Passado</div>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Rodapé com resumo */}
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
            <div className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
              {availableSlots} horário{availableSlots !== 1 ? 's' : ''} disponível{availableSlots !== 1 ? 'eis' : ''} • {doctorAppts.length} agendado{doctorAppts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DoctorSchedulePopover;
