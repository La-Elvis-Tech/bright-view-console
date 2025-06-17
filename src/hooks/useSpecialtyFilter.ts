
import { useMemo } from 'react';
import { Doctor as DoctorType } from './useDoctors';
import { ExamType as ExamTypeType } from './useExamTypes';

const specialtyExamMapping: Record<string, string[]> = {
  'Cardiologia': ['Eletrocardiograma', 'Ecocardiograma', 'Teste Ergométrico', 'Holter'],
  'Radiologia': ['Raio-X', 'Tomografia', 'Ressonância Magnética', 'Ultrassom'],
  'Dermatologia': ['Biópsia de Pele', 'Dermatoscopia', 'Fototerapia'],
  'Neurologia': ['Eletroencefalograma', 'Ressonância Magnética Cerebral'],
  'Ortopedia': ['Raio-X Ossos', 'Ressonância Magnética Articular'],
  'Laboratório': ['Hemograma', 'Bioquímica', 'Urina', 'Fezes'],
  'Endocrinologia': ['Glicemia', 'Hormônios Tireoidianos', 'Cortisol'],
  'Ginecologia': ['Papanicolau', 'Colposcopia', 'Ultrassom Pélvico'],
  'Oftalmologia': ['Acuidade Visual', 'Tonometria', 'Fundo de Olho'],
  'Clínica Geral': [] // Pode realizar qualquer exame básico
};

export const useSpecialtyFilter = () => {
  const filterExamsByDoctorSpecialty = (
    doctors: DoctorType[],
    examTypes: ExamTypeType[],
    selectedDoctorId?: string
  ) => {
    if (!selectedDoctorId) {
      return { filteredDoctors: doctors, filteredExamTypes: [] };
    }

    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
    if (!selectedDoctor) {
      return { filteredDoctors: doctors, filteredExamTypes: [] };
    }

    const doctorSpecialty = selectedDoctor.specialty || 'Clínica Geral';
    const allowedExams = specialtyExamMapping[doctorSpecialty] || [];
    
    // Se é Clínica Geral, pode fazer exames básicos de laboratório
    const filteredExamTypes = doctorSpecialty === 'Clínica Geral' 
      ? examTypes.filter(exam => 
          exam.category === 'Laboratório' || 
          exam.category === 'Clínica Geral' ||
          allowedExams.some(allowed => exam.name.toLowerCase().includes(allowed.toLowerCase()))
        )
      : examTypes.filter(exam => 
          allowedExams.some(allowed => exam.name.toLowerCase().includes(allowed.toLowerCase())) ||
          exam.category === doctorSpecialty
        );

    return { 
      filteredDoctors: doctors, 
      filteredExamTypes 
    };
  };

  const filterDoctorsByExamType = (
    doctors: DoctorType[],
    examTypes: ExamTypeType[],
    selectedExamTypeId?: string
  ) => {
    if (!selectedExamTypeId) {
      return { filteredDoctors: doctors, filteredExamTypes: examTypes };
    }

    const selectedExam = examTypes.find(e => e.id === selectedExamTypeId);
    if (!selectedExam) {
      return { filteredDoctors: doctors, filteredExamTypes: examTypes };
    }

    const examCategory = selectedExam.category;
    const examName = selectedExam.name;

    // Encontrar especialidades que podem realizar este exame
    const compatibleSpecialties = Object.entries(specialtyExamMapping)
      .filter(([specialty, exams]) => 
        specialty === examCategory ||
        exams.some(exam => examName.toLowerCase().includes(exam.toLowerCase())) ||
        specialty === 'Clínica Geral' // Clínica Geral pode fazer exames básicos
      )
      .map(([specialty]) => specialty);

    const filteredDoctors = doctors.filter(doctor => 
      compatibleSpecialties.includes(doctor.specialty || 'Clínica Geral')
    );

    return { 
      filteredDoctors, 
      filteredExamTypes: examTypes 
    };
  };

  return {
    filterExamsByDoctorSpecialty,
    filterDoctorsByExamType,
    specialtyExamMapping
  };
};
