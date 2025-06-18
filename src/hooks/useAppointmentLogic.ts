
import { useState, useEffect } from 'react';
import { useSupabaseAppointments } from './useSupabaseAppointments';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentLogic = () => {
  const { doctors, examTypes, units } = useSupabaseAppointments();
  const { profile, isAdmin, isSupervisor } = useAuthContext();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(profile?.unit_id || '');
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [filteredExamTypes, setFilteredExamTypes] = useState(examTypes);

  // Mapeamento mais flexível de especialidades médicas
  const specialtyExamMapping: Record<string, string[]> = {
    'Cardiologia': ['cardio', 'coração', 'ecg', 'eco', 'pressao'],
    'Endocrinologia': ['diabetes', 'hormonio', 'tireoid', 'glicemia', 'insulina'],
    'Hematologia': ['sangue', 'hemograma', 'coagul', 'plaquetas'],
    'Gastroenterologia': ['gastro', 'digestiv', 'endoscop'],
    'Neurologia': ['neuro', 'cerebr', 'encefalograma'],
    'Ortopedia': ['osso', 'articular', 'raio-x', 'radiografia'],
    'Dermatologia': ['pele', 'dermat'],
    'Oftalmologia': ['olho', 'ocular', 'visao'],
    'Urologia': ['urina', 'psa', 'prostata'],
    'Ginecologia': ['gineco', 'mama', 'papanicolau'],
    'Pneumologia': ['pulmonar', 'respirat', 'torax'],
    'Laboratório': ['laboratorial', 'coleta', 'analise'],
    'Clínica Geral': [] // Pode fazer todos os exames básicos
  };

  // Filtrar médicos por unidade
  useEffect(() => {
    console.log('Filtering doctors. Total doctors:', doctors.length);
    
    let filtered = doctors.filter(doctor => 
      doctor.id && 
      doctor.name && 
      doctor.name.trim() !== ''
    );

    // Se usuário não é admin/supervisor, mostrar apenas médicos da sua unidade
    if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
      filtered = filtered.filter(doctor => doctor.unit_id === profile.unit_id);
      console.log('Filtered by user unit:', profile.unit_id, 'Result:', filtered.length);
    } else if (selectedUnit) {
      // Se uma unidade está selecionada, filtrar médicos por ela
      filtered = filtered.filter(doctor => doctor.unit_id === selectedUnit);
      console.log('Filtered by selected unit:', selectedUnit, 'Result:', filtered.length);
    }

    console.log('Final filtered doctors:', filtered.length);
    setFilteredDoctors(filtered);
  }, [doctors, profile?.unit_id, selectedUnit, isAdmin, isSupervisor]);

  // Filtrar tipos de exame - mais permissivo
  useEffect(() => {
    console.log('Filtering exam types. Total exam types:', examTypes.length);
    console.log('Selected doctor:', selectedDoctor);

    let filtered = examTypes.filter(exam => 
      exam.id && 
      exam.name && 
      exam.name.trim() !== ''
    );

    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      console.log('Doctor found:', doctor);
      
      if (doctor?.specialty && doctor.specialty !== 'Clínica Geral') {
        const allowedExamKeywords = specialtyExamMapping[doctor.specialty] || [];
        console.log('Doctor specialty:', doctor.specialty);
        console.log('Allowed keywords:', allowedExamKeywords);
        
        if (allowedExamKeywords.length > 0) {
          // Filtro mais permissivo
          filtered = filtered.filter(exam => {
            const isSpecialtyMatch = allowedExamKeywords.some(keyword => 
              exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
              exam.category?.toLowerCase().includes(keyword.toLowerCase())
            );
            
            // Sempre permitir exames básicos/gerais
            const isBasicExam = [
              'consulta', 'avaliacao', 'geral', 'basico', 'rotina', 
              'checkup', 'preventivo', 'triagem'
            ].some(basic =>
              exam.name.toLowerCase().includes(basic.toLowerCase()) ||
              exam.category?.toLowerCase().includes(basic.toLowerCase())
            );
            
            return isSpecialtyMatch || isBasicExam;
          });
        }
      }
      // Se é Clínica Geral ou não tem especialidade, permite todos os exames
    }

    console.log('Final filtered exam types:', filtered.length);
    setFilteredExamTypes(filtered);
  }, [selectedDoctor, doctors, examTypes]);

  const handleDoctorChange = (doctorId: string) => {
    console.log('Doctor changed to:', doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (doctor) {
      console.log('Doctor details:', doctor);
      // Atualizar unidade automaticamente se necessário
      if (doctor.unit_id && doctor.unit_id !== selectedUnit) {
        setSelectedUnit(doctor.unit_id);
        const unitName = units.find(u => u.id === doctor.unit_id)?.name;
        console.log('Unit updated to:', unitName);
        toast({
          title: 'Unidade atualizada',
          description: `Unidade alterada para ${unitName || 'a unidade do médico'}.`,
        });
      }
    }
    
    setSelectedDoctor(doctorId);
    
    // Limpar exame selecionado para forçar nova seleção
    if (selectedExamType) {
      setSelectedExamType('');
      console.log('Exam type cleared due to doctor change');
    }
  };

  const handleExamTypeChange = (examTypeId: string) => {
    console.log('Exam type changed to:', examTypeId);
    setSelectedExamType(examTypeId);
  };

  const handleUnitChange = (unitId: string) => {
    console.log('Unit changed to:', unitId);
    // Se trocar a unidade e há um médico selecionado, verificar compatibilidade
    if (selectedDoctor && unitId) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor && doctor.unit_id !== unitId) {
        setSelectedDoctor('');
        setSelectedExamType('');
        toast({
          title: 'Seleções atualizadas',
          description: 'Médico e exame foram limpos devido à mudança de unidade.',
          variant: 'default'
        });
      }
    }
    
    setSelectedUnit(unitId);
  };

  // Verificação mais flexível de compatibilidade
  const checkDoctorExamCompatibility = (doctor: any, examTypeId: string) => {
    // Clínica geral sempre pode
    if (!doctor.specialty || doctor.specialty === 'Clínica Geral') {
      return true;
    }

    const exam = examTypes.find(e => e.id === examTypeId);
    if (!exam) return false;

    const allowedExamKeywords = specialtyExamMapping[doctor.specialty] || [];
    
    // Se não há mapeamento específico, permite
    if (allowedExamKeywords.length === 0) {
      return true;
    }

    // Verifica compatibilidade específica
    const isCompatible = allowedExamKeywords.some(keyword => 
      exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
      exam.category?.toLowerCase().includes(keyword.toLowerCase())
    );

    // Permite exames básicos
    const isBasicExam = [
      'consulta', 'avaliacao', 'geral', 'basico', 'rotina',
      'checkup', 'preventivo', 'triagem'
    ].some(basic =>
      exam.name.toLowerCase().includes(basic.toLowerCase()) ||
      exam.category?.toLowerCase().includes(basic.toLowerCase())
    );

    return isCompatible || isBasicExam;
  };

  return {
    selectedDoctor,
    selectedExamType,
    selectedUnit,
    filteredDoctors,
    filteredExamTypes,
    handleDoctorChange,
    handleExamTypeChange,
    handleUnitChange,
    specialtyExamMapping,
    checkDoctorExamCompatibility
  };
};
