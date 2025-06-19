
import React from 'react';
import { isToday, isAfter, startOfToday, getDay } from 'date-fns';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';
import { User } from 'lucide-react';
import DoctorSchedulePopover from './DoctorSchedulePopover';

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
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);
  const isWeekend = getDay(day) === 0 || getDay(day) === 6;

  return (
    <div className="h-full flex flex-col space-y-2 p-2">
      {doctors.length > 0 ? (
        <div className="space-y-2">
          {doctors.map((doctor) => (
            <DoctorSchedulePopover
              key={doctor.id}
              doctor={doctor}
              day={day}
              appointments={appointments}
              onSelectSlot={onSelectSlot}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-neutral-400 dark:text-neutral-500 py-8">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum médico disponível</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarByDoctor;
