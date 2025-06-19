
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, DollarSign, Plus, X, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { useAppointmentLogic } from '@/hooks/useAppointmentLogic';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface CreateAppointmentFormProps {
  onAppointmentCreated?: () => void;
  onClose?: () => void;
  prefilledData?: {
    date: string;
    time: string;
    doctorId: string;
    doctorName: string;
  } | null;
}

const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({ 
  onAppointmentCreated, 
  onClose,
  prefilledData 
}) => {
  const { 
    createAppointment, 
    loading: dataLoading,
    units,
    doctors,
    examTypes
  } = useSupabaseAppointments();

  const {
    selectedDoctor,
    selectedExamType,
    selectedUnit,
    filteredDoctors,
    filteredExamTypes,
    handleDoctorChange,
    handleExamTypeChange,
    handleUnitChange
  } = useAppointmentLogic();

  const { profile, isAdmin, isSupervisor } = useAuthContext();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  
  // Pré-definir data com ano 2025
  const getDefaultDate = () => {
    const today = new Date();
    const defaultDate = new Date(2025, today.getMonth(), today.getDate());
    return defaultDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    date: prefilledData?.date || getDefaultDate(),
    time: prefilledData?.time || '',
    duration_minutes: 30,
    cost: 0,
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validação de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Formatação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Validar formulário
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.patient_name.trim()) {
      errors.push('Nome do paciente é obrigatório');
    }

    if (formData.patient_email && !isValidEmail(formData.patient_email)) {
      errors.push('Email deve ter um formato válido (exemplo@dominio.com)');
    }

    if (!selectedDoctor) {
      errors.push('Selecione um médico');
    }

    if (!selectedExamType) {
      errors.push('Selecione um tipo de exame');
    }

    if (!formData.date) {
      errors.push('Selecione uma data');
    }

    if (!formData.time) {
      errors.push('Selecione um horário');
    }

    // Validar se o médico selecionado existe
    const doctorExists = doctors.find(d => d.id === selectedDoctor);
    if (selectedDoctor && !doctorExists) {
      errors.push('Médico selecionado não é válido');
    }

    // Validar se o tipo de exame selecionado existe
    const examTypeExists = examTypes.find(e => e.id === selectedExamType);
    if (selectedExamType && !examTypeExists) {
      errors.push('Tipo de exame selecionado não é válido');
    }

    // Validar unidade para admin/supervisor
    if ((isAdmin() || isSupervisor()) && selectedUnit) {
      const unitExists = units.find(u => u.id === selectedUnit);
      if (!unitExists) {
        errors.push('Unidade selecionada não é válida');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Atualizar formulário quando prefilledData mudar
  useEffect(() => {
    if (prefilledData) {
      console.log('Prefilled data received:', prefilledData);
      setFormData(prev => ({
        ...prev,
        date: prefilledData.date,
        time: prefilledData.time,
      }));
      if (prefilledData.doctorId) {
        handleDoctorChange(prefilledData.doctorId);
      }
    }
  }, [prefilledData, handleDoctorChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (!validateForm()) {
      toast({
        title: "Formulário incompleto",
        description: "Corrija os erros listados para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Determinar a unidade - seguindo a estrutura da tabela
      let unitToUse: string;
      
      if (isAdmin() || isSupervisor()) {
        // Admin/supervisor pode escolher qualquer unidade ou usar a própria
        unitToUse = selectedUnit || profile.unit_id || '';
      } else {
        // Usuário comum usa sempre sua própria unidade
        unitToUse = profile.unit_id || '';
      }
      
      // Verificações de segurança baseadas na estrutura da tabela
      if (!unitToUse) {
        throw new Error('Unidade é obrigatória para criar agendamento.');
      }

      if (!selectedDoctor) {
        throw new Error('Médico é obrigatório.');
      }

      if (!selectedExamType) {
        throw new Error('Tipo de exame é obrigatório.');
      }

      // Verificar se a unidade existe e é válida
      const unitExists = units.find(unit => unit.id === unitToUse);
      if (!unitExists) {
        throw new Error('A unidade selecionada não existe.');
      }

      // Verificar se o médico existe e é válido
      const doctorExists = doctors.find(d => d.id === selectedDoctor);
      if (!doctorExists) {
        throw new Error('O médico selecionado não existe.');
      }

      // Verificar se o tipo de exame existe e é válido
      const examTypeExists = examTypes.find(e => e.id === selectedExamType);
      if (!examTypeExists) {
        throw new Error('O tipo de exame selecionado não existe.');
      }

      console.log('Creating appointment with validated data:', {
        unitToUse,
        selectedDoctor,
        selectedExamType,
        doctorExists: doctorExists?.name,
        examTypeExists: examTypeExists?.name,
        unitExists: unitExists?.name
      });

      // Criar data no formato correto para PostgreSQL
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      // Verificar se a data é válida
      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Data ou horário inválido.');
      }

      // Dados do agendamento seguindo exatamente a estrutura da tabela
      const appointmentData = {
        patient_name: formData.patient_name.trim(),
        patient_email: formData.patient_email.trim() || null,
        patient_phone: formData.patient_phone.trim() || null,
        exam_type_id: selectedExamType,
        doctor_id: selectedDoctor,
        unit_id: unitToUse,
        scheduled_date: appointmentDate.toISOString(),
        duration_minutes: formData.duration_minutes || 30,
        status: 'Agendado' as const, // Usar valor exato do enum
        cost: formData.cost > 0 ? Number(formData.cost.toFixed(2)) : null, // Formato correto para numeric(10,2)
        notes: formData.notes.trim() || null,
        created_by: profile.id // Campo obrigatório
      };

      console.log('Final appointment data (matching table structure):', appointmentData);

      await createAppointment(appointmentData);

      toast({
        title: "Agendamento criado com sucesso!",
        description: `Consulta marcada para ${formData.date} às ${formData.time} com ${doctorExists.name}`,
      });

      onAppointmentCreated?.();
      
      // Reset form
      setFormData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        date: getDefaultDate(),
        time: '',
        duration_minutes: 30,
        cost: 0,
        notes: ''
      });
      handleDoctorChange('');
      handleExamTypeChange('');
      handleUnitChange('');
      setValidationErrors([]);

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      
      let errorMessage = 'Erro desconhecido ao criar agendamento';
      
      if (error?.message) {
        if (error.message.includes('violates row-level security')) {
          errorMessage = 'Você não tem permissão para criar agendamentos nesta unidade';
        } else if (error.message.includes('violates foreign key constraint')) {
          if (error.message.includes('doctor_id')) {
            errorMessage = 'O médico selecionado não é válido';
          } else if (error.message.includes('exam_type_id')) {
            errorMessage = 'O tipo de exame selecionado não é válido';
          } else if (error.message.includes('unit_id')) {
            errorMessage = 'A unidade selecionada não é válida';
          } else if (error.message.includes('created_by')) {
            errorMessage = 'Erro de autenticação do usuário';
          } else {
            errorMessage = 'Dados de referência inválidos';
          }
        } else if (error.message.includes('check constraint')) {
          errorMessage = 'Status de agendamento inválido';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao criar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === 'patient_phone' && typeof value === 'string') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (validationErrors.length > 0) {
      setTimeout(validateForm, 100);
    }
  };

  // Filtrar unidades válidas
  const validUnits = units.filter(unit => 
    unit.id && 
    unit.name && 
    unit.name.trim() !== ''
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
                <Plus className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                Criar Novo Agendamento
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300 mt-1">
                {prefilledData ? 
                  `Horário selecionado: ${prefilledData.time} com ${prefilledData.doctorName}` :
                  'Preencha as informações para criar um novo agendamento'
                }
              </CardDescription>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="font-medium mb-2">Corrija os seguintes problemas:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Paciente */}
              <div className="space-y-2">
                <Label htmlFor="patient_name" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                  Paciente *
                </Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  placeholder="Nome completo do paciente"
                  required
                  className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('Nome do paciente')) ? 'border-red-500' : ''
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="patient_email" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </Label>
                <Input
                  id="patient_email"
                  type="email"
                  value={formData.patient_email}
                  onChange={(e) => handleInputChange('patient_email', e.target.value)}
                  placeholder="exemplo@dominio.com"
                  className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('Email')) ? 'border-red-500' : ''
                  }`}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="patient_phone" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Telefone
                </Label>
                <Input
                  id="patient_phone"
                  value={formData.patient_phone}
                  onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </div>

              {/* Unidade - mostrar se usuário pode escolher */}
              {(isAdmin() || isSupervisor()) && (
                <div className="space-y-2">
                  <Label htmlFor="unit_id" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <MapPin className="h-4 w-4" />
                    Unidade *
                  </Label>
                  <Select value={selectedUnit} onValueChange={handleUnitChange}>
                    <SelectTrigger className={`border-neutral-200 dark:border-neutral-700 ${
                      validationErrors.some(e => e.includes('Unidade')) ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {validUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Médico */}
              <div className="space-y-2">
                <Label htmlFor="doctor_id" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                  Médico *
                </Label>
                <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
                  <SelectTrigger className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('médico')) ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-neutral-500">
                            {doctor.specialty || 'Clínica Geral'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de exame */}
              <div className="space-y-2">
                <Label htmlFor="exam_type_id" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Stethoscope className="h-4 w-4" />
                  Tipo de Exame *
                </Label>
                <Select 
                  value={selectedExamType} 
                  onValueChange={handleExamTypeChange}
                  disabled={!selectedDoctor}
                >
                  <SelectTrigger className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('exame')) ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder={selectedDoctor ? "Selecione o tipo" : "Selecione um médico primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredExamTypes.length > 0 ? (
                      filteredExamTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{type.name}</span>
                            {type.category && (
                              <span className="text-sm text-neutral-500">{type.category}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-exams" disabled>
                        Nenhum exame disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Calendar className="h-4 w-4" />
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min="2025-01-01"
                  required
                  className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('data')) ? 'border-red-500' : ''
                  }`}
                />
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Clock className="h-4 w-4" />
                  Horário *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                  className={`border-neutral-200 dark:border-neutral-700 ${
                    validationErrors.some(e => e.includes('horário')) ? 'border-red-500' : ''
                  }`}
                />
              </div>

              {/* Custo */}
              <div className="space-y-2">
                <Label htmlFor="cost" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <DollarSign className="h-4 w-4" />
                  Custo (R$)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Observações
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações adicionais..."
                className="border-neutral-200 dark:border-neutral-700"
              />
            </div>

            <div className="flex justify-end gap-3">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || dataLoading}
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Agendamento
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAppointmentForm;
