
import React from 'react';
import { Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
  doctorId?: string;
  hasConflict?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface EnhancedAvailableTimesGridProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  onSelectTime: (time: string, doctorId?: string) => void;
  selectedDoctor: string;
  doctors: Doctor[];
  onDoctorChange: (doctorId: string) => void;
  selectedTimeSlot?: string;
}

const EnhancedAvailableTimesGrid: React.FC<EnhancedAvailableTimesGridProps> = ({
  selectedDate,
  timeSlots,
  onSelectTime,
  selectedDoctor,
  doctors,
  onDoctorChange,
  selectedTimeSlot
}) => {
  const formatDoctorName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return name;
    return `Dr. ${parts[0]} ${parts[parts.length - 1]}`;
  };

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.time]) {
      acc[slot.time] = [];
    }
    acc[slot.time].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const timeKeys = Object.keys(groupedSlots).sort();

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
      <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <CardTitle className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <div className="text-base">Horários Disponíveis</div>
            <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </CardTitle>

        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            Filtrar por Médico (opcional)
          </label>
          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
            <SelectTrigger className="w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
              <SelectValue placeholder="Todos os médicos" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
              <SelectItem value="all">Todos os médicos</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatDoctorName(doctor.name)}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {doctor.specialty || 'Clínica Geral'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {timeKeys.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhum horário disponível</p>
            <p className="text-sm">Tente selecionar outro dia ou médico</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {timeKeys.map((time) => {
              const slots = groupedSlots[time];
              const availableSlot = slots.find(s => s.available);
              const hasConflict = slots.some(s => s.hasConflict);
              const isSelected = selectedTimeSlot === time;
              
              if (!availableSlot && !selectedDoctor) return null;
              
              const slot = selectedDoctor && selectedDoctor !== "all"
                ? slots.find(s => s.doctorId === selectedDoctor) 
                : availableSlot;
              
              if (!slot) return null;

              return (
                <Button
                  key={`${time}-${slot.doctorId}`}
                  variant={isSelected ? "default" : slot.available ? "outline" : "secondary"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => onSelectTime(time, slot.doctorId)}
                  className={`
                    h-auto p-2 flex flex-col items-center text-center transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-500 text-white border-blue-600 shadow-md ring-2 ring-blue-200' 
                      : ''
                    }
                    ${hasConflict && !slot.available 
                      ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300' 
                      : ''
                    }
                    ${slot.available && !isSelected
                      ? 'hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-800'
                      : ''
                    }
                  `}
                >
                  <div className="font-medium text-sm">
                    {time}
                  </div>
                  {slot.doctorName && (
                    <div className="text-xs opacity-75 mt-1 line-clamp-2">
                      {formatDoctorName(slot.doctorName)}
                    </div>
                  )}
                  {hasConflict && !slot.available && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Ocupado
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-neutral-300 rounded"></div>
            <span>Disponível</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAvailableTimesGrid;
