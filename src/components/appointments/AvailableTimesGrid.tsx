
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
  doctorId?: string;
}

interface AvailableTimesGridProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  onSelectTime: (time: string, doctorId?: string) => void;
  selectedDoctor?: string;
  doctors: Array<{ id: string; name: string; specialty: string }>;
  onDoctorChange: (doctorId: string) => void;
}

const AvailableTimesGrid: React.FC<AvailableTimesGridProps> = ({
  selectedDate,
  timeSlots,
  onSelectTime,
  selectedDoctor,
  doctors,
  onDoctorChange,
}) => {
  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 8 && hour < 12;
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 18;
  });

  const formatDoctorName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return `Dr. ${name}`;
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const renderTimeGrid = (slots: TimeSlot[], title: string) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
        <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        {title}
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {slots.map((slot) => (
          <Button
            key={`${slot.time}-${slot.doctorId}`}
            variant={slot.available ? "outline" : "ghost"}
            size="sm"
            disabled={!slot.available}
            onClick={() => onSelectTime(slot.time, slot.doctorId)}
            className={`h-16 flex flex-col p-2 text-xs transition-all duration-200 ${
              slot.available 
                ? 'hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-800 dark:border-neutral-600 shadow-sm hover:shadow-md border-neutral-200' 
                : 'opacity-30 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'
            }`}
          >
            <div className="text-center w-full">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {slot.time}
              </div>
              {slot.doctorName && (
                <div className="text-xs truncate max-w-full text-neutral-600 dark:text-neutral-400 mt-1">
                  {formatDoctorName(slot.doctorName)}
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
      {slots.length === 0 && (
        <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum horário disponível neste período</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
      <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-3 mb-2">
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <div className="text-base font-medium">Horários Disponíveis</div>
            <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </CardTitle>
        
        {/* Filtro de Médicos */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={!selectedDoctor ? "default" : "outline"}
            size="sm"
            onClick={() => onDoctorChange('')}
            className={`text-xs h-8 ${
              !selectedDoctor 
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900' 
                : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <User className="h-3 w-3 mr-1" />
            Todos os médicos
          </Button>
          {doctors.map((doctor) => (
            <Button
              key={doctor.id}
              variant={selectedDoctor === doctor.id ? "default" : "outline"}
              size="sm"
              onClick={() => onDoctorChange(doctor.id)}
              className={`text-xs h-8 ${
                selectedDoctor === doctor.id 
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900' 
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <User className="h-3 w-3 mr-1" />
              {formatDoctorName(doctor.name)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {morningSlots.length > 0 && renderTimeGrid(morningSlots, "Manhã (08:00 - 12:00)")}
        {afternoonSlots.length > 0 && renderTimeGrid(afternoonSlots, "Tarde (12:00 - 18:00)")}
        
        {timeSlots.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-base font-medium">
              Nenhum horário disponível
            </p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-1">
              Selecione uma data diferente ou outro médico
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableTimesGrid;
