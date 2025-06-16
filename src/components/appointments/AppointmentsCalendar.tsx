
import React from 'react';
import { Calendar } from "@/components/ui/calendar";

interface AppointmentsCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setIsCalendarOpen: (isOpen: boolean) => void;
  appointmentDates: Date[];
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  selectedDate,
  setSelectedDate,
  setIsCalendarOpen,
  appointmentDates,
}) => {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
      }}
      modifiers={{
        hasAppointment: appointmentDates,
      }}
      modifiersStyles={{
        hasAppointment: {
          color: '#dc2626',
          fontWeight: 'bold',
        }
      }}
      className="pointer-events-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md"
    />
  );
};

export default AppointmentsCalendar;
