
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

  // Mapeamento simplificado de especialidades médicas
  const specialtyExamMapping: Record<string, string[]> = {
    'Cardiologia': ['cardio', 'coração', 'ecg', 'eco'],
    'Endocrinologia': ['diabetes', 'hormonio', 'tireoid', 'glicemia'],
    'Hematologia': ['sangue', 'hemograma', 'coagul'],
    'Gastroenterologia': ['gastro', 'digestiv', 'endoscop'],
    'Neurologia': ['neuro', 'cerebr', 'encefalograma'],
    'Ortopedia': ['osso', 'articular', 'raio-x'],
    'Dermatologia': ['pele', 'dermat'],
    'Oftalmologia': ['olho', 'ocular', 'visao'],
    'Urologia': ['urina', 'psa', 'prostata'],
    'Ginecologia': ['gineco', 'mama', 'papanicolau'],
    'Pneumologia': ['pulmonar', 'respirat', 'torax'],
    'Laboratório': ['laboratorial', 'coleta', 'analise'],
    'Clínica Geral': [] // Pode fazer exames básicos
  };

  // Filtrar médicos por unidade
  useEffect(() => {
    let filtered = doctors.filter(doctor => 
      doctor.id && 
      doctor.name && 
      doctor.name.trim() !== ''
    );

    // Se usuário não é admin/supervisor, mostrar apenas médicos da sua unidade
    if (!isAdmin() && !isSupervisor() && profile?.unit_id) {
      filtered = filtered.filter(doctor => doctor.unit_id === profile.unit_id);
    } else if (selectedUnit) {
      // Se uma unidade está selecionada, filtrar médicos por ela
      filtered = filtered.filter(doctor => doctor.unit_id === selectedUnit);
    }

    setFilteredDoctors(filtered);
  }, [doctors, profile?.unit_id, selectedUnit, isAdmin, isSupervisor]);

  // Filtrar tipos de exame de forma mais flexível
  useEffect(() => {
    let filtered = examTypes.filter(exam => 
      exam.id && 
      exam.name && 
      exam.name.trim() !== ''
    );

    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor?.specialty && doctor.specialty !== 'Clínica Geral') {
        const allowedExamKeywords = specialtyExamMapping[doctor.specialty] || [];
        
        if (allowedExamKeywords.length > 0) {
          filtered = filtered.filter(exam => {
            // Se não há compatibilidade exata, permite exames básicos
            const isCompatible = allowedExamKeywords.some(keyword => 
              exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
              exam.category?.toLowerCase().includes(keyword.toLowerCase())
            );
            
            // Permitir também exames básicos/gerais
            const isBasicExam = ['consulta', 'avaliacao', 'geral', 'basico', 'rotina'].some(basic =>
              exam.name.toLowerCase().includes(basic.toLowerCase())
            );
            
            return isCompatible || isBasicExam;
          });
        }
      }
    }

    setFilteredExamTypes(filtered);
  }, [selectedDoctor, doctors, examTypes]);

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (doctor) {
      // Atualizar unidade automaticamente se necessário
      if (doctor.unit_id && doctor.unit_id !== selectedUnit) {
        setSelectedUnit(doctor.unit_id);
        toast({
          title: 'Unidade atualizada',
          description: `Unidade alterada para ${units.find(u => u.id === doctor.unit_id)?.name || 'a unidade do médico'}.`,
        });
      }
    }
    
    setSelectedDoctor(doctorId);
    
    // Limpar exame selecionado para forçar nova seleção
    if (selectedExamType) {
      setSelectedExamType('');
    }
  };

  const handleExamTypeChange = (examTypeId: string) => {
    setSelectedExamType(examTypeId);
  };

  const handleUnitChange = (unitId: string) => {
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
    const isBasicExam = ['consulta', 'avaliacao', 'geral', 'basico', 'rotina'].some(basic =>
      exam.name.toLowerCase().includes(basic.toLowerCase())
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
