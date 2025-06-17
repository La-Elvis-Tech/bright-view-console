
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Calendar } from 'lucide-react';

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
  selectedTimeSlot: string;
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
  const filteredSlots = selectedDoctor 
    ? timeSlots.filter(slot => slot.doctorId === selectedDoctor)
    : timeSlots;

  const getTimeSlotStyle = (slot: TimeSlot) => {
    const isSelected = selectedTimeSlot === slot.time && (!selectedDoctor || slot.doctorId === selectedDoctor);
    
    if (isSelected) {
      return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md';
    }
    
    if (!slot.available || slot.hasConflict) {
      return 'bg-red-500 text-white cursor-not-allowed opacity-75 border-red-600';
    }
    
    return 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-700';
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
      <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Horários Disponíveis
            </CardTitle>
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </div>
        
        {doctors.length > 1 && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Filtrar por médico:
              </span>
            </div>
            <Select value={selectedDoctor} onValueChange={onDoctorChange}>
              <SelectTrigger className="w-full bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Todos os médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os médicos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        {filteredSlots.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum horário disponível</p>
            <p className="text-sm">Não há horários disponíveis para a data selecionada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-neutral-200 rounded"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Selecionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Ocupado</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredSlots.map((slot) => (
                <button
                  key={`${slot.time}-${slot.doctorId || 'all'}`}
                  onClick={() => {
                    if (slot.available && !slot.hasConflict) {
                      onSelectTime(slot.time, slot.doctorId);
                    }
                  }}
                  disabled={!slot.available || slot.hasConflict}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2
                    ${getTimeSlotStyle(slot)}
                    ${(!slot.available || slot.hasConflict) ? '' : 'hover:scale-105 active:scale-95'}
                  `}
                  title={
                    !slot.available || slot.hasConflict 
                      ? `Horário ocupado${slot.doctorName ? ` - ${slot.doctorName}` : ''}`
                      : `Disponível${slot.doctorName ? ` - ${slot.doctorName}` : ''}`
                  }
                >
                  <div className="font-semibold">{slot.time}</div>
                  {slot.doctorName && !selectedDoctor && (
                    <div className="text-xs opacity-80 truncate mt-1">
                      {slot.doctorName.split(' ')[0]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAvailableTimesGrid;
