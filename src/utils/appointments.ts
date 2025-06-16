
import { Appointment, UnitSummary } from "@/types/appointment";
import { addDays, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

// Get status badge color
export const getStatusColor = (status: string): string => {
  switch(status) {
    case 'Concluído': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'Confirmado': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
  }
};

// Filter appointments by date range
export const filterAppointmentsByPeriod = (
  appointments: Appointment[], 
  startDate: Date, 
  endDate?: Date
): Appointment[] => {
  return appointments.filter(app => {
    const appDate = startOfDay(new Date(app.date));
    if (endDate) {
      return (isAfter(appDate, startDate) || isSameDay(appDate, startDate)) && 
            (isBefore(appDate, endDate) || isSameDay(appDate, endDate));
    }
    return isSameDay(appDate, startDate);
  });
};

// Get appointments by unit
export const getUnitsSummary = (appointments: Appointment[]): UnitSummary[] => {
  const unitAppointments = appointments.reduce((acc, app) => {
    const unit = app.unit;
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(app);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Units list with appointment counts
  return Object.keys(unitAppointments).map(unit => ({
    name: unit,
    count: unitAppointments[unit].length,
    appointments: unitAppointments[unit]
  }));
};
