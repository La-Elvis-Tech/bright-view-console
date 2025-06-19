
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

  // Mapeamento mais específico e flexível de especialidades médicas
  const specialtyExamMapping: Record<string, string[]> = {
    'Cardiologia': ['cardio', 'coração', 'ecg', 'eco', 'pressao', 'ergométrico', 'holter', 'eletrocardiograma', 'ecocardiograma'],
    'Endocrinologia': ['diabetes', 'hormonio', 'tireoid', 'glicemia', 'insulina', 'cortisol', 'endocrino'],
    'Hematologia': ['sangue', 'hemograma', 'coagul', 'plaquetas', 'hematócrito'],
    'Gastroenterologia': ['gastro', 'digestiv', 'endoscop', 'colonoscopia', 'estômago'],
    'Neurologia': ['neuro', 'cerebr', 'encefalograma', 'ressonância cerebral'],
    'Ortopedia': ['osso', 'articular', 'raio-x', 'radiografia', 'ressonância articular', 'ortopédico'],
    'Dermatologia': ['pele', 'dermat', 'biópsia', 'dermatoscopia'],
    'Oftalmologia': ['olho', 'ocular', 'visao', 'acuidade', 'fundo de olho'],
    'Urologia': ['urina', 'psa', 'prostata', 'renal', 'urológico'],
    'Ginecologia': ['gineco', 'mama', 'papanicolau', 'ultrassom pélvico'],
    'Pneumologia': ['pulmonar', 'respirat', 'torax', 'espirometria'],
    'Radiologia': [
      'raio-x', 'tomografia', 'ressonância', 'ultrassom', 'mamografia', 'densitometria', 
      'radiografia', 'tc', 'rm', 'us', 'radio', 'imagem', 'diagnóstico por imagem',
      'contrast', 'angiografia', 'fluoroscopia', 'rx', 'tomo', 'ressonancia'
    ],
    'Endoscopia': [
      'endoscopia', 'colonoscopia', 'gastroscopia', 'broncoscopia', 'endoscópico',
      'endoscopia digestiva', 'videoendoscopia', 'sigmoidoscopia', 'retossigmoidoscopia',
      'endoscopia alta', 'endoscopia baixa', 'endo'
    ],
    'Laboratório': ['laboratorial', 'coleta', 'analise', 'sangue', 'urina', 'lab'],
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

  // Filtrar tipos de exame - corrigido para ser mais permissivo
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
      
      if (doctor?.specialty) {
        const doctorSpecialty = doctor.specialty.trim();
        console.log('Doctor specialty:', doctorSpecialty);
        
        // Para Clínica Geral, permite todos os exames
        if (doctorSpecialty === 'Clínica Geral') {
          console.log('Clínica Geral - allowing all exams');
        } else {
          // Para outras especialidades, aplicar filtro mais flexível
          const allowedExamKeywords = specialtyExamMapping[doctorSpecialty] || [];
          console.log('Allowed keywords for', doctorSpecialty, ':', allowedExamKeywords);
          
          if (allowedExamKeywords.length > 0) {
            filtered = filtered.filter(exam => {
              const examNameLower = exam.name.toLowerCase().trim();
              const examCategoryLower = (exam.category || '').toLowerCase().trim();
              
              // Verificar se o nome do exame ou categoria contém palavras-chave da especialidade
              const isSpecialtyMatch = allowedExamKeywords.some(keyword => 
                examNameLower.includes(keyword.toLowerCase()) ||
                examCategoryLower.includes(keyword.toLowerCase())
              );
              
              // Verificar se a categoria do exame corresponde exatamente à especialidade
              const isCategoryMatch = examCategoryLower === doctorSpecialty.toLowerCase();
              
              // Sempre permitir exames básicos/gerais
              const isBasicExam = [
                'consulta', 'avaliacao', 'geral', 'basico', 'rotina', 
                'checkup', 'preventivo', 'triagem', 'clinico'
              ].some(basic =>
                examNameLower.includes(basic.toLowerCase()) ||
                examCategoryLower.includes(basic.toLowerCase())
              );
              
              const shouldInclude = isSpecialtyMatch || isCategoryMatch || isBasicExam;
              
              if (shouldInclude) {
                console.log(`✓ Exam "${exam.name}" - included for ${doctorSpecialty}`);
              } else {
                console.log(`✗ Exam "${exam.name}" - excluded for ${doctorSpecialty}`);
              }
              
              return shouldInclude;
            });
          }
        }
      } else {
        console.log('Doctor has no specialty - allowing all exams');
      }
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
    
    // NÃO limpar exame selecionado automaticamente - deixar o usuário escolher
    console.log('Doctor changed - keeping selected exam type:', selectedExamType);
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

  // Verificação de compatibilidade
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
    const examNameLower = exam.name.toLowerCase();
    const examCategoryLower = (exam.category || '').toLowerCase();
    
    const isCompatible = allowedExamKeywords.some(keyword => 
      examNameLower.includes(keyword.toLowerCase()) ||
      examCategoryLower.includes(keyword.toLowerCase())
    ) || examCategoryLower === doctor.specialty.toLowerCase();

    // Permite exames básicos
    const isBasicExam = [
      'consulta', 'avaliacao', 'geral', 'basico', 'rotina',
      'checkup', 'preventivo', 'triagem'
    ].some(basic =>
      examNameLower.includes(basic.toLowerCase()) ||
      examCategoryLower.includes(basic.toLowerCase())
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
