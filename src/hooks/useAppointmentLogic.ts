
import { useState, useEffect } from 'react';
import { useSupabaseAppointments } from './useSupabaseAppointments';
import { useAuthContext } from '@/context/AuthContext';

export const useAppointmentLogic = () => {
  const { doctors, examTypes, units } = useSupabaseAppointments();
  const { profile, isAdmin, isSupervisor } = useAuthContext();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [filteredExamTypes, setFilteredExamTypes] = useState(examTypes);

  // Mapeamento de especialidades médicas com tipos de exame compatíveis
  const specialtyExamMapping: Record<string, string[]> = {
    'Cardiologia': ['eletrocardiograma', 'ecocardiograma', 'teste ergométrico', 'holter'],
    'Endocrinologia': ['glicemia', 'hemoglobina glicada', 'tsh', 't3', 't4', 'insulina'],
    'Hematologia': ['hemograma', 'coagulograma', 'tempo de protrombina', 'plaquetas'],
    'Gastroenterologia': ['endoscopia', 'colonoscopia', 'ultrassom abdominal'],
    'Neurologia': ['eletroencefalograma', 'ressonância magnética', 'tomografia'],
    'Ortopedia': ['raio-x', 'ressonância magnética', 'tomografia', 'densitometria'],
    'Dermatologia': ['biópsia', 'dermatoscopia', 'patch test'],
    'Oftalmologia': ['fundoscopia', 'campo visual', 'tonometria'],
    'Urologia': ['ultrassom', 'urina', 'psa'],
    'Ginecologia': ['papanicolau', 'ultrassom pélvico', 'mamografia'],
    'Pneumologia': ['espirometria', 'raio-x tórax', 'gasometria'],
    'Clínica Geral': [] // Pode fazer qualquer exame
  };

  // Filtrar médicos por unidade
  useEffect(() => {
    let filtered = doctors;

    // Se usuário não é admin/supervisor, mostrar apenas médicos da sua unidade
    if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
      filtered = doctors.filter(doctor => doctor.unit_id === profile.unit_id);
    }

    setFilteredDoctors(filtered);
  }, [doctors, profile?.unit_id, isAdmin, isSupervisor]);

  // Filtrar tipos de exame baseado no médico selecionado
  useEffect(() => {
    if (!selectedDoctor) {
      setFilteredExamTypes(examTypes);
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor?.specialty) {
      setFilteredExamTypes(examTypes);
      return;
    }

    const allowedExamKeywords = specialtyExamMapping[doctor.specialty] || [];
    
    // Se é clínica geral ou não tem mapeamento, mostrar todos
    if (allowedExamKeywords.length === 0) {
      setFilteredExamTypes(examTypes);
      return;
    }

    // Filtrar exames compatíveis com a especialidade
    const compatibleExams = examTypes.filter(exam => 
      allowedExamKeywords.some(keyword => 
        exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
        exam.category?.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    setFilteredExamTypes(compatibleExams);
  }, [selectedDoctor, doctors, examTypes]);

  // Reset exam type quando trocar médico
  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedExamType(''); // Reset exam selection
  };

  const handleExamTypeChange = (examTypeId: string) => {
    setSelectedExamType(examTypeId);
  };

  return {
    selectedDoctor,
    selectedExamType,
    filteredDoctors,
    filteredExamTypes,
    handleDoctorChange,
    handleExamTypeChange,
    specialtyExamMapping
  };
};
