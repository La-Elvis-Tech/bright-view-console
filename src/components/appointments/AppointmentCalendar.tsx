
import React, { useState, useEffect } from 'react';
import { addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import WeeklyCalendarHeader from './WeeklyCalendarHeader';
import WeeklyCalendarDay from './WeeklyCalendarDay';
import DoctorFilterCalendar from './DoctorFilterCalendar';
import EnhancedAvailableTimesGrid from './EnhancedAvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, Filter } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'unified' | 'filtered'>('unified');
  
  const { getAvailableSlots } = useAvailableSlots();
  const { doctors, loading: doctorsLoading } = useDoctors();

  console.log('AppointmentCalendar - doctors loaded:', doctors.length);
  console.log('AppointmentCalendar - appointments loaded:', appointments.length);

  useEffect(() => {
    if (selectedDate && doctors.length > 0 && viewMode === 'unified') {
      console.log('Loading slots for date:', selectedDate, 'with doctors:', doctors.length);
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor, doctors, appointments, viewMode]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || doctors.length === 0) {
      console.log('Skipping slot loading - no date or doctors');
      return;
    }
    
    console.log('Loading slots for all doctors on date:', selectedDate);
    
    try {
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
    setSelectedDoctor(doctorId);
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <WeeklyCalendarHeader 
              currentWeek={currentWeek}
              onNavigateWeek={navigateWeek}
            />
            
            <div className="flex items-center gap-3">
              {/* Filtro de médico */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-500" />
                <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os médicos</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Toggle para modo de visualização */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'unified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('unified')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Geral
                </Button>
                <Button
                  variant={viewMode === 'filtered' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('filtered')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Por Médico
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              
              return viewMode === 'unified' ? (
                <WeeklyCalendarDay
                  key={day.toISOString()}
                  day={day}
                  appointments={dayAppointments}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectAppointment={onSelectAppointment}
                />
              ) : (
                <DoctorFilterCalendar
                  key={day.toISOString()}
                  day={day}
                  appointments={dayAppointments}
                  doctors={doctors}
                  selectedDate={selectedDate}
                  selectedDoctor={selectedDoctor}
                  onSelectDate={setSelectedDate}
                  onSelectSlot={onSelectSlot}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && doctors.length > 0 && viewMode === 'unified' && (
        <EnhancedAvailableTimesGrid
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          onSelectTime={handleSelectTime}
          selectedDoctor={selectedDoctor === 'all' ? '' : selectedDoctor}
          doctors={doctors}
          onDoctorChange={handleDoctorChange}
          selectedTimeSlot={selectedTimeSlot}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
