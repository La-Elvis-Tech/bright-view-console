
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isAfter, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Users 
} from 'lucide-react';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import AvailableTimesGrid from './AvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';

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
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  
  const { getAvailableSlots } = useAvailableSlots();
  const { doctors } = useDoctors();

  useEffect(() => {
    if (selectedDate && doctors.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor, doctors]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || doctors.length === 0) return;
    
    const slots = await getAvailableSlots(selectedDate, doctors, selectedDoctor);
    setTimeSlots(slots);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-500 text-white';
      case 'Confirmado': return 'bg-emerald-500 text-white';
      case 'Em andamento': return 'bg-amber-500 text-white';
      case 'Concluído': return 'bg-gray-500 text-white';
      case 'Cancelado': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.scheduled_date), date)
    );
  };

  const handleSelectTime = (time: string, doctorId?: string) => {
    if (!selectedDate) return;
    
    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));
    const doctorName = doctors.find(d => d.id === doctorId)?.name;
    
    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId,
      doctorName
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const formatDoctorName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return name;
    return `Dr. ${parts[0]} ${parts[parts.length - 1]}`;
  };

  return (
    <div className="space-y-6">
      {/* Calendário Semanal */}
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <div className="text-base">Calendário Semanal</div>
                <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                  Selecione uma data para ver horários disponíveis
                </div>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-3 text-neutral-700 dark:text-neutral-300 min-w-[140px] text-center">
                {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isPast = !isAfter(day, startOfToday()) && !isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[90px] border-2
                    ${isSelected 
                      ? 'bg-neutral-50 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600 shadow-sm' 
                      : 'bg-neutral-25 border-neutral-150 hover:bg-neutral-50 hover:border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800'
                    }
                    ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                    ${isToday(day) ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
                  `}
                  onClick={() => !isPast && setSelectedDate(day)}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday(day) 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
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
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded-lg py-1">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                    {dayAppointments.length === 0 && !isPast && (
                      <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-1">
                        Disponível
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grade de Horários Disponíveis */}
      {selectedDate && doctors.length > 0 && (
        <AvailableTimesGrid
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          onSelectTime={handleSelectTime}
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          onDoctorChange={setSelectedDoctor}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
