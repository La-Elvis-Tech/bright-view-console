
import React, { useState, useEffect } from 'react';
import { format, isSameDay, isToday, isAfter, startOfToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';
import { Button } from '@/components/ui/button';

interface WeeklyCalendarByDoctorProps {
  day: Date;
  appointments: SupabaseAppointment[];
  doctors: Doctor[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const WeeklyCalendarByDoctor: React.FC<WeeklyCalendarByDoctorProps> = ({
  day,
  appointments,
  doctors,
  selectedDate,
  onSelectDate,
  onSelectSlot
}) => {
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);
  const isWeekend = getDay(day) === 0 || getDay(day) === 6; // 0 = domingo, 6 = sábado

  // Horários disponíveis baseados no dia da semana
  const getAvailableHours = () => {
    if (isWeekend) {
      // Fins de semana: 8:00 às 14:00
      return [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'
      ];
    } else {
      // Dias úteis: 7:00 às 17:30
      return [
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
    }
  };

  const availableHours = getAvailableHours();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': 
      case 'Confirmado': 
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'Em andamento': 
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'Concluído': 
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'Cancelado': 
        return 'bg-gray-400 hover:bg-gray-500 text-white';
      default: 
        return 'bg-red-500 hover:bg-red-600 text-white';
    }
  };

  const getDoctorAppointments = (doctorId: string) => {
    return appointments.filter(appointment => 
      appointment.doctor_id === doctorId && isSameDay(new Date(appointment.scheduled_date), day)
    );
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
        p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[400px] border-2
        ${isSelected 
          ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'bg-neutral-25 border-neutral-150 hover:bg-neutral-50 hover:border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800'
        }
        ${isPast ? 'opacity-40' : ''}
        ${isToday(day) ? 'ring-2 ring-indigo-200 dark:ring-indigo-800' : ''}
      `}
      onClick={() => !isPast && onSelectDate(day)}
    >
      {/* Cabeçalho do dia */}
      <div className="text-center mb-3 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
          {format(day, 'EEE', { locale: ptBR })}
        </div>
        <div className={`text-lg font-semibold mt-1 ${
          isToday(day) 
            ? 'text-indigo-600 dark:text-indigo-400' 
            : isSelected
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-neutral-900 dark:text-neutral-100'
        }`}>
          {format(day, 'd')}
        </div>
        {isWeekend && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Horário Reduzido
          </div>
        )}
      </div>
      
      {/* Subdivisões por médico */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {doctors.slice(0, 3).map((doctor) => {
          const doctorAppts = getDoctorAppointments(doctor.id);
          
          return (
            <div key={doctor.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-2">
              <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2 truncate">
                Dr. {doctor.name}
              </div>
              
              {/* Primeiros horários do médico */}
              <div className="space-y-1">
                {availableHours.slice(0, 4).map((time) => {
                  const isTaken = isTimeSlotTaken(doctor.id, time);
                  const appointment = doctorAppts.find(appt => 
                    format(new Date(appt.scheduled_date), 'HH:mm') === time
                  );
                  
                  if (isTaken && appointment) {
                    return (
                      <div
                        key={time}
                        className={`text-xs p-1.5 rounded text-center cursor-pointer transition-all ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-semibold">{time}</div>
                        <div className="truncate text-xs opacity-90">
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
                        className="w-full h-8 text-xs p-1 border-neutral-300 dark:border-neutral-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeSlotClick(doctor.id, doctor.name, time);
                        }}
                      >
                        {time}
                      </Button>
                    );
                  }
                  
                  return null;
                })}
                
                {doctorAppts.length > 4 && (
                  <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded py-1">
                    +{doctorAppts.length - 4} agendamentos
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {doctors.length > 3 && (
          <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded-lg py-2">
            +{doctors.length - 3} médicos
          </div>
        )}
        
        {doctors.length === 0 && (
          <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-4">
            Nenhum médico disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendarByDoctor;
