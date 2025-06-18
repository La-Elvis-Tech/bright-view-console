
import React, { useState, useEffect } from 'react';
import { addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import WeeklyCalendarHeader from './WeeklyCalendarHeader';
import WeeklyCalendarDay from './WeeklyCalendarDay';
import EnhancedAvailableTimesGrid from './EnhancedAvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AppointmentCalendarProps {
  appointments: SupabaseAppointment[];
  onSelectAppointment?: (appointment: SupabaseAppointment) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; time?: string; doctorId?: string; doctorName?: string }) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  
  const { getAvailableSlots } = useAvailableSlots();
  const { doctors, loading: doctorsLoading } = useDoctors();

  console.log('AppointmentCalendar - doctors loaded:', doctors.length);
  console.log('AppointmentCalendar - appointments loaded:', appointments.length);

  useEffect(() => {
    if (selectedDate && doctors.length > 0) {
      console.log('Loading slots for date:', selectedDate, 'with doctors:', doctors.length);
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor, doctors, appointments]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || doctors.length === 0) {
      console.log('Skipping slot loading - no date or doctors');
      return;
    }
    
    console.log('Loading slots for all doctors on date:', selectedDate);
    
    try {
      // Buscar horários para todos os médicos da unidade
      const slots = await getAvailableSlots(selectedDate, doctors);
      
      console.log('Total slots loaded:', slots.length);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setTimeSlots([]);
    }
  };

  const handleSelectTime = (time: string, doctorId?: string) => {
    if (!selectedDate) return;
    
    setSelectedTimeSlot(time);
    
    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));
    const doctorName = doctors.find(d => d.id === doctorId)?.name;
    
    console.log('Time slot selected:', { time, doctorId, doctorName });
    
    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId,
      doctorName
    });
  };

  const handleDoctorChange = (doctorId: string) => {
    console.log('Doctor filter changed:', doctorId);
    setSelectedDoctor(doctorId === 'all' ? '' : doctorId);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
    setSelectedDate(null);
    setSelectedTimeSlot('');
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.scheduled_date), date)
    );
  };

  if (doctorsLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-neutral-500 dark:text-neutral-400">
                Carregando médicos da unidade...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-neutral-900 dark:text-neutral-100 text-lg font-medium mb-2">
                Nenhum médico encontrado
              </p>
              <p className="text-neutral-500 dark:text-neutral-400">
                Não há médicos cadastrados para esta unidade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <WeeklyCalendarHeader 
            currentWeek={currentWeek}
            onNavigateWeek={navigateWeek}
          />
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              
              return (
                <WeeklyCalendarDay
                  key={day.toISOString()}
                  day={day}
                  appointments={dayAppointments}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectAppointment={onSelectAppointment}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && doctors.length > 0 && (
        <EnhancedAvailableTimesGrid
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          onSelectTime={handleSelectTime}
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          onDoctorChange={handleDoctorChange}
          selectedTimeSlot={selectedTimeSlot}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
