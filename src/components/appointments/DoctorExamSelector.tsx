
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Stethoscope } from 'lucide-react';
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
  const [filteredExamTypes, setFilteredExamTypes] = useState(examTypes);

  // Mapear especialidades dos médicos com tipos de exame
  const doctorExamMapping: Record<string, string[]> = {
    'Cardiologia': ['Eletrocardiograma', 'Ecocardiograma', 'Teste Ergométrico'],
    'Dermatologia': ['Biópsia de Pele', 'Dermatoscopia'],
    'Ortopedia': ['Raio-X', 'Ressonância Magnética'],
    'Neurologia': ['Eletroencefalograma', 'Tomografia'],
    'Pediatria': ['Consulta Pediátrica', 'Vacinação'],
  };

  useEffect(() => {
    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor?.specialty && doctorExamMapping[doctor.specialty]) {
        const allowedExams = doctorExamMapping[doctor.specialty];
        const filtered = examTypes.filter(exam => 
          allowedExams.some(allowed => exam.name.includes(allowed))
        );
        setFilteredExamTypes(filtered);
      } else {
        setFilteredExamTypes(examTypes);
      }
    } else {
      setFilteredExamTypes(examTypes);
    }
  }, [selectedDoctor, doctors, examTypes]);

  const handleDoctorChange = (doctorId: string) => {
    onDoctorChange(doctorId);
    // Reset exam type when doctor changes
    onExamTypeChange('');
  };

  return (
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
            {doctors.map((doctor) => (
              <SelectItem 
                key={doctor.id} 
                value={doctor.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{doctor.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {doctor.specialty}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exam Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          Tipo de Exame
        </label>
        <Select 
          value={selectedExamType} 
          onValueChange={onExamTypeChange}
          disabled={!selectedDoctor}
        >
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
      </div>
    </div>
  );
};

export default DoctorExamSelector;
