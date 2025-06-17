import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, DollarSign, Plus, X } from 'lucide-react';
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
import { useSupabaseAppointments, type MaterialValidation as MaterialValidationType } from '@/hooks/useSupabaseAppointments';
import { useAppointmentLogic } from '@/hooks/useAppointmentLogic';
import { useAuthContext } from '@/context/AuthContext';
import MaterialValidation from './MaterialValidation';
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
    calculateExamMaterials, 
    loading: dataLoading,
    units
  } = useSupabaseAppointments();

  const {
    selectedDoctor,
    selectedExamType,
    filteredDoctors,
    filteredExamTypes,
    handleDoctorChange,
    handleExamTypeChange
  } = useAppointmentLogic();

  const { profile, isAdmin, isSupervisor } = useAuthContext();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [materialValidation, setMaterialValidation] = useState<MaterialValidationType | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    date: prefilledData?.date || '',
    time: prefilledData?.time || '',
    unit_id: profile?.unit_id || '',
    duration_minutes: 30,
    cost: 0,
    notes: ''
  });

  // Unidades disponíveis baseadas no perfil do usuário
  const availableUnits = React.useMemo(() => {
    // Se é admin/supervisor, pode escolher qualquer unidade
    if (isAdmin() || isSupervisor()) {
      return []; // Será preenchido pelo hook useSupabaseAppointments
    }
    // Usuário comum só pode agendar na sua unidade
    return profile?.unit_id ? [{ id: profile.unit_id, name: 'Sua Unidade', code: '' }] : [];
  }, [profile?.unit_id, isAdmin, isSupervisor]);

  // Atualizar formulário quando prefilledData mudar
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        date: prefilledData.date,
        time: prefilledData.time,
      }));
      handleDoctorChange(prefilledData.doctorId);
    }
  }, [prefilledData, handleDoctorChange]);

  // Calcular materiais quando o tipo de exame mudar
  useEffect(() => {
    if (selectedExamType) {
      setLoadingMaterials(true);
      calculateExamMaterials(selectedExamType)
        .then(setMaterialValidation)
        .catch(() => setMaterialValidation(null))
        .finally(() => setLoadingMaterials(false));
    } else {
      setMaterialValidation(null);
    }
  }, [selectedExamType, calculateExamMaterials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se os materiais foram validados
    if (!materialValidation) {
      toast({
        title: "Selecione um tipo de exame",
        description: "É necessário selecionar um tipo de exame para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!materialValidation.canSchedule) {
      toast({
        title: "Materiais insuficientes",
        description: "Não é possível agendar devido a materiais insuficientes. Verifique o estoque.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      await createAppointment({
        patient_name: formData.patient_name,
        patient_email: formData.patient_email || undefined,
        patient_phone: formData.patient_phone || undefined,
        exam_type_id: selectedExamType,
        doctor_id: selectedDoctor,
        unit_id: formData.unit_id,
        scheduled_date: appointmentDate.toISOString(),
        duration_minutes: formData.duration_minutes,
        cost: formData.cost || undefined,
        notes: formData.notes || undefined,
        status: 'Agendado'
      });

      onAppointmentCreated?.();
      
      // Reset form
      setFormData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        date: '',
        time: '',
        unit_id: profile?.unit_id || '',
        duration_minutes: 30,
        cost: 0,
        notes: ''
      });
      handleDoctorChange('');
      handleExamTypeChange('');
      setMaterialValidation(null);

    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canSubmit = materialValidation?.canSchedule && 
    formData.patient_name && 
    selectedExamType && 
    formData.date && 
    formData.time && 
    selectedDoctor && 
    formData.unit_id;

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
                  placeholder="Nome do paciente"
                  required
                  className="border-neutral-200 dark:border-neutral-700"
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
                  placeholder="email@exemplo.com"
                  className="border-neutral-200 dark:border-neutral-700"
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
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </div>

              {/* Médico */}
              <div className="space-y-2">
                <Label htmlFor="doctor_id" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                  Médico *
                </Label>
                <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
                  <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
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
                {filteredDoctors.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Nenhum médico disponível para sua unidade.
                  </p>
                )}
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
                  <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredExamTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                        {type.category && ` - ${type.category}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDoctor && filteredExamTypes.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Nenhum exame disponível para esta especialidade.
                  </p>
                )}
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
                  required
                  className="border-neutral-200 dark:border-neutral-700"
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
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </div>

              {/* Unidade - só mostra se usuário pode escolher */}
              {(isAdmin() || isSupervisor()) && (
                <div className="space-y-2">
                  <Label htmlFor="unit_id" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <MapPin className="h-4 w-4" />
                    Unidade *
                  </Label>
                  <Select value={formData.unit_id} onValueChange={(value) => handleInputChange('unit_id', value)}>
                    <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                disabled={isCreating || !canSubmit}
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

      {/* Validação de Materiais */}
      <MaterialValidation 
        validation={materialValidation} 
        loading={loadingMaterials} 
      />
    </div>
  );
};

export default CreateAppointmentForm;
