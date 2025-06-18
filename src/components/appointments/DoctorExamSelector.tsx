
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Stethoscope, AlertCircle } from 'lucide-react';
import { useSpecialtyFilter } from '@/hooks/useSpecialtyFilter';
import { useDoctors } from '@/hooks/useDoctors';
import { useExamTypes } from '@/hooks/useExamTypes';

interface DoctorExamSelectorProps {
  selectedDoctor: string;
  selectedExamType: string;
  onDoctorChange: (doctorId: string) => void;
  onExamTypeChange: (examTypeId: string) => void;
}

const DoctorExamSelector: React.FC<DoctorExamSelectorProps> = ({
  selectedDoctor,
  selectedExamType,
  onDoctorChange,
  onExamTypeChange
}) => {
  const { doctors } = useDoctors();
  const { examTypes } = useExamTypes();
  const { filterExamsByDoctorSpecialty, filterDoctorsByExamType } = useSpecialtyFilter();
  
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [filteredExamTypes, setFilteredExamTypes] = useState(examTypes);

  // Atualizar listas filtradas quando seleções mudarem
  useEffect(() => {
    if (selectedDoctor && !selectedExamType) {
      const result = filterExamsByDoctorSpecialty(doctors, examTypes, selectedDoctor);
      setFilteredDoctors(result.filteredDoctors);
      setFilteredExamTypes(result.filteredExamTypes);
    } else if (selectedExamType && !selectedDoctor) {
      const result = filterDoctorsByExamType(doctors, examTypes, selectedExamType);
      setFilteredDoctors(result.filteredDoctors);
      setFilteredExamTypes(result.filteredExamTypes);
    } else if (!selectedDoctor && !selectedExamType) {
      setFilteredDoctors(doctors);
      setFilteredExamTypes(examTypes);
    }
  }, [selectedDoctor, selectedExamType, doctors, examTypes]);

  const handleDoctorChange = (doctorId: string) => {
    onDoctorChange(doctorId);
    
    // Limpar seleção de exame se não for compatível
    if (selectedExamType) {
      const result = filterExamsByDoctorSpecialty(doctors, examTypes, doctorId);
      const isExamCompatible = result.filteredExamTypes.some(exam => exam.id === selectedExamType);
      if (!isExamCompatible) {
        onExamTypeChange('');
      }
    }
  };

  const handleExamTypeChange = (examTypeId: string) => {
    onExamTypeChange(examTypeId);
    
    // Limpar seleção de médico se não for compatível
    if (selectedDoctor) {
      const result = filterDoctorsByExamType(doctors, examTypes, examTypeId);
      const isDoctorCompatible = result.filteredDoctors.some(doctor => doctor.id === selectedDoctor);
      if (!isDoctorCompatible) {
        onDoctorChange('');
      }
    }
  };

  const getIncompatibilityMessage = () => {
    if (selectedDoctor && selectedExamType) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      const exam = examTypes.find(e => e.id === selectedExamType);
      
      if (doctor && exam) {
        const result = filterExamsByDoctorSpecialty(doctors, examTypes, selectedDoctor);
        const isCompatible = result.filteredExamTypes.some(e => e.id === selectedExamType);
        
        if (!isCompatible) {
          return `Dr(a). ${doctor.name} (${doctor.specialty || 'Clínica Geral'}) não pode realizar ${exam.name}`;
        }
      }
    }
    return null;
  };

  const incompatibilityMessage = getIncompatibilityMessage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="h-4 w-4" />
            Médico
          </label>
          <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Selecione o médico" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {filteredDoctors.map((doctor) => (
                <SelectItem 
                  key={doctor.id} 
                  value={doctor.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{doctor.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {doctor.specialty || 'Clínica Geral'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedExamType && filteredDoctors.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Nenhum médico disponível para este exame.
            </p>
          )}
        </div>

        {/* Exam Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Tipo de Exame
          </label>
          <Select value={selectedExamType} onValueChange={handleExamTypeChange}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Selecione o tipo de exame" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {filteredExamTypes.map((examType) => (
                <SelectItem 
                  key={examType.id} 
                  value={examType.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{examType.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {examType.duration_minutes} min - {examType.category}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDoctor && filteredExamTypes.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Nenhum exame disponível para esta especialidade médica.
            </p>
          )}
        </div>
      </div>

      {/* Incompatibility Warning */}
      {incompatibilityMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Incompatibilidade Detectada
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {incompatibilityMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compatibility Info */}
      {(selectedDoctor || selectedExamType) && !incompatibilityMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-800 dark:text-green-200">
              {selectedDoctor && selectedExamType 
                ? 'Médico e exame são compatíveis' 
                : 'Seleção válida - continue escolhendo'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorExamSelector;
