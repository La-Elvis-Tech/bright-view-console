
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

  // Mapeamento de especialidades médicas com tipos de exame compatíveis
  const specialtyExamMapping: Record<string, string[]> = {
    'Cardiologia': ['eletrocardiograma', 'ecocardiograma', 'teste ergométrico', 'holter', 'cardiovascular'],
    'Endocrinologia': ['glicemia', 'hemoglobina glicada', 'tsh', 't3', 't4', 'insulina', 'hormonio', 'diabetes'],
    'Hematologia': ['hemograma', 'coagulograma', 'tempo de protrombina', 'plaquetas', 'sangue', 'hematocrito'],
    'Gastroenterologia': ['endoscopia', 'colonoscopia', 'ultrassom abdominal', 'gastro', 'digestivo'],
    'Neurologia': ['eletroencefalograma', 'ressonância magnética', 'tomografia', 'neurologico', 'cerebral'],
    'Ortopedia': ['raio-x', 'ressonância magnética', 'tomografia', 'densitometria', 'osso', 'articular'],
    'Dermatologia': ['biópsia', 'dermatoscopia', 'patch test', 'pele', 'dermatologico'],
    'Oftalmologia': ['fundoscopia', 'campo visual', 'tonometria', 'ocular', 'visao'],
    'Urologia': ['ultrassom', 'urina', 'psa', 'urologico', 'prostata'],
    'Ginecologia': ['papanicolau', 'ultrassom pélvico', 'mamografia', 'ginecologico', 'mama'],
    'Pneumologia': ['espirometria', 'raio-x tórax', 'gasometria', 'pulmonar', 'respiratorio'],
    'Laboratório': ['hemograma', 'bioquímica', 'urina', 'fezes', 'sangue', 'laboratorial'],
    'Clínica Geral': [] // Pode fazer qualquer exame básico
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

  // Filtrar tipos de exame baseado no médico selecionado
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
          filtered = filtered.filter(exam => 
            allowedExamKeywords.some(keyword => 
              exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
              exam.category?.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        }
      }
    }

    setFilteredExamTypes(filtered);
  }, [selectedDoctor, doctors, examTypes]);

  // Sincronizar unidade quando médico é selecionado
  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (doctor) {
      // Se o médico tem uma unidade diferente da selecionada, atualizar
      if (doctor.unit_id && doctor.unit_id !== selectedUnit) {
        setSelectedUnit(doctor.unit_id);
        toast({
          title: 'Unidade atualizada',
          description: `Unidade alterada automaticamente para a unidade do médico selecionado.`,
        });
      }
    }
    
    setSelectedDoctor(doctorId);
    
    // Verificar compatibilidade com exame já selecionado
    if (selectedExamType && doctor) {
      const isCompatible = checkDoctorExamCompatibility(doctor, selectedExamType);
      if (!isCompatible) {
        setSelectedExamType('');
        toast({
          title: 'Incompatibilidade detectada',
          description: `O exame selecionado não é compatível com a especialidade do médico ${doctor.name}.`,
          variant: 'destructive'
        });
      }
    }
  };

  // Verificar compatibilidade médico-exame
  const checkDoctorExamCompatibility = (doctor: any, examTypeId: string) => {
    if (!doctor.specialty || doctor.specialty === 'Clínica Geral') {
      return true; // Clínica geral pode fazer qualquer exame básico
    }

    const exam = examTypes.find(e => e.id === examTypeId);
    if (!exam) return false;

    const allowedExamKeywords = specialtyExamMapping[doctor.specialty] || [];
    if (allowedExamKeywords.length === 0) {
      return true; // Se não há mapeamento, permite
    }

    return allowedExamKeywords.some(keyword => 
      exam.name.toLowerCase().includes(keyword.toLowerCase()) ||
      exam.category?.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleExamTypeChange = (examTypeId: string) => {
    // Verificar compatibilidade com médico já selecionado
    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor) {
        const isCompatible = checkDoctorExamCompatibility(doctor, examTypeId);
        if (!isCompatible) {
          toast({
            title: 'Incompatibilidade detectada',
            description: `Este exame não pode ser realizado pelo médico ${doctor.name} (${doctor.specialty}).`,
            variant: 'destructive'
          });
          return; // Não permite a seleção
        }
      }
    }
    
    setSelectedExamType(examTypeId);
  };

  const handleUnitChange = (unitId: string) => {
    // Se trocar a unidade e há um médico selecionado, verificar se o médico pertence à nova unidade
    if (selectedDoctor && unitId) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor && doctor.unit_id !== unitId) {
        setSelectedDoctor('');
        toast({
          title: 'Médico removido',
          description: 'O médico selecionado não pertence à unidade escolhida.',
          variant: 'destructive'
        });
      }
    }
    
    setSelectedUnit(unitId);
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
