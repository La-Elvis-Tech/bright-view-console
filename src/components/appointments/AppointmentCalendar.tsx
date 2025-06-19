
import React from 'react';
import EnhancedWeeklyCalendar from './EnhancedWeeklyCalendar';
import { SupabaseAppointment } from '@/types/appointment';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';

interface AppointmentCalendarProps {
  appointments: SupabaseAppointment[];
  onSelectAppointment?: (appointment: SupabaseAppointment) => void;
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot
}) => {
  const { doctors, units } = useSupabaseAppointments();

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
      <EnhancedWeeklyCalendar
        appointments={appointments}
        doctors={doctors}
        units={units}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
};

export default AppointmentCalendar;
