
import React from 'react';
import { format, isSameDay, isToday, isAfter, startOfToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface DoctorFilterCalendarProps {
  day: Date;
  appointments: SupabaseAppointment[];
  doctors: Doctor[];
  selectedDate: Date | null;
  selectedDoctor: string;
  onSelectDate: (date: Date) => void;
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const DoctorFilterCalendar: React.FC<DoctorFilterCalendarProps> = ({
  day,
  appointments,
  doctors,
  selectedDate,
  selectedDoctor,
  onSelectDate,
  onSelectSlot
}) => {
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);
  const isWeekend = getDay(day) === 0 || getDay(day) === 6;

  // Horários baseados no dia da semana
  const getAvailableHours = () => {
    if (isWeekend) {
      return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
    } else {
      return ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    }
  };

  const availableHours = getAvailableHours();
  
  // Filtrar médicos e agendamentos
  const filteredDoctors = selectedDoctor && selectedDoctor !== 'all' 
    ? doctors.filter(d => d.id === selectedDoctor)
    : doctors.slice(0, 4);

  const dayAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.scheduled_date), day)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': 
      case 'Confirmado': 
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'Em andamento': 
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'Concluído': 
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Cancelado': 
        return 'bg-gray-400 hover:bg-gray-500 text-white';
      default: 
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getDoctorAppointments = (doctorId: string) => {
    return dayAppointments.filter(appointment => appointment.doctor_id === doctorId);
  };

  const isTimeSlotTaken = (doctorId: string, time: string) => {
    const doctorAppts = getDoctorAppointments(doctorId);
    return doctorAppts.some(appt => {
      const apptTime = format(new Date(appt.scheduled_date), 'HH:mm');
      return apptTime === time;
    });
  };

  const handleTimeSlotClick = (doctorId: string, doctorName: string, time: string) => {
    if (isPast || isTimeSlotTaken(doctorId, time)) return;

    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(day);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));

    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId,
      doctorName
    });
  };

  return (
    <div
      className={`
        p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[300px] border-2
        ${isSelected 
          ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600 shadow-md' 
          : 'bg-white border-neutral-200 hover:border-blue-200 dark:bg-neutral-900 dark:border-neutral-700'
        }
        ${isPast ? 'opacity-40' : ''}
        ${isToday(day) ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''}
      `}
      onClick={() => !isPast && onSelectDate(day)}
    >
      {/* Cabeçalho do dia */}
      <div className="text-center mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-700">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
          {format(day, 'EEE', { locale: ptBR })}
        </div>
        <div className={`text-lg font-bold mt-1 ${
          isToday(day) 
            ? 'text-blue-600 dark:text-blue-400' 
            : isSelected
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-neutral-900 dark:text-neutral-100'
        }`}>
          {format(day, 'd')}
        </div>
        {isWeekend && (
          <Badge variant="outline" className="text-xs mt-1">
            Horário Reduzido
          </Badge>
        )}
      </div>
      
      {/* Lista de médicos e horários */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredDoctors.map((doctor) => {
          const doctorAppts = getDoctorAppointments(doctor.id);
          const busySlots = doctorAppts.length;
          const availableSlots = availableHours.length - busySlots;
          
          return (
            <div key={doctor.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {doctor.name}
                  </span>
                </div>
                <Badge variant={availableSlots > 0 ? "default" : "secondary"} className="text-xs">
                  {availableSlots} livres
                </Badge>
              </div>
              
              {/* Horários ocupados */}
              {doctorAppts.slice(0, 3).map((appointment) => {
                const time = format(new Date(appointment.scheduled_date), 'HH:mm');
                return (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1.5 rounded mb-1 cursor-pointer transition-all ${getStatusColor(appointment.status)}`}
                  >
                    <div className="font-semibold">{time}</div>
                    <div className="truncate opacity-90">
                      {appointment.patient_name}
                    </div>
                  </div>
                );
              })}
              
              {/* Botão para agendar se há horários livres */}
              {!isPast && availableSlots > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs mt-1 border-dashed border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Encontrar primeiro horário livre
                    const freeTime = availableHours.find(time => !isTimeSlotTaken(doctor.id, time));
                    if (freeTime) {
                      handleTimeSlotClick(doctor.id, doctor.name, freeTime);
                    }
                  }}
                >
                  + Agendar
                </Button>
              )}
              
              {doctorAppts.length > 3 && (
                <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-700 rounded py-1 mt-1">
                  +{doctorAppts.length - 3} agendamentos
                </div>
              )}
            </div>
          );
        })}
        
        {filteredDoctors.length === 0 && (
          <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-8">
            Nenhum médico disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorFilterCalendar;
