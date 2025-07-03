
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AppointmentCalendar from './AppointmentCalendar';
import CreateAppointmentForm from './CreateAppointmentForm';
import DoctorManagement from './DoctorManagement';
import ExamTypeManagement from './ExamTypeManagement';
import AppointmentsStats from './AppointmentsStats';
import AppointmentTabs from './AppointmentTabs';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { useToast } from '@/hooks/use-toast';
import { SkeletonAppointments } from '@/components/ui/skeleton-appointments';

interface SelectedSlotData {
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
}

const AppointmentsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState<SelectedSlotData | null>(null);
  const { toast } = useToast();
  
  const { 
    appointments, 
    examTypes, 
    doctors, 
    units, 
    loading,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    createExamType,
    updateExamType,
    deleteExamType,
    refreshAppointments,
  } = useSupabaseAppointments();

  const handleSelectAppointment = (appointment: any) => {
    console.log('Selected appointment:', appointment);
  };

  const handleSelectSlot = (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string 
  }) => {
    console.log('Selected slot:', slotInfo);
    
    if (slotInfo.time && slotInfo.doctorId && slotInfo.doctorName) {
      setSelectedSlotData({
        date: slotInfo.start.toISOString().split('T')[0],
        time: slotInfo.time,
        doctorId: slotInfo.doctorId,
        doctorName: slotInfo.doctorName
      });
      
      setShowCreateForm(true);
      setActiveTab('calendar');
      
      toast({
        title: 'Horário selecionado',
        description: `${slotInfo.time} com ${slotInfo.doctorName}`,
      });
    }
  };

  const handleCreateAppointment = async () => {
    setShowCreateForm(false);
    setSelectedSlotData(null);
    await refreshAppointments();
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setSelectedSlotData(null);
  };

  // Wrapper functions that match expected signatures by discarding return values
  const handleCreateDoctor = async (doctorData: {
    name: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }): Promise<void> => {
    await createDoctor(doctorData);
  };

  const handleUpdateDoctor = async (id: string, updates: {
    name?: string;
    specialty?: string;
    crm?: string;
    email?: string;
    phone?: string;
    unit_id?: string;
  }): Promise<void> => {
    await updateDoctor(id, updates);
  };

  const handleDeleteDoctor = async (id: string): Promise<void> => {
    await deleteDoctor(id);
  };

  const handleCreateExamType = async (examTypeData: {
    name: string;
    category?: string;
    description?: string;
    duration_minutes?: number;
    cost?: number;
    requires_preparation?: boolean;
    preparation_instructions?: string;
  }): Promise<void> => {
    await createExamType(examTypeData);
  };

  const handleUpdateExamType = async (id: string, updates: {
    name?: string;
    category?: string;
    description?: string;
    duration_minutes?: number;
    cost?: number;
    requires_preparation?: boolean;
    preparation_instructions?: string;
  }): Promise<void> => {
    await updateExamType(id, updates);
  };

  const handleDeleteExamType = async (id: string): Promise<void> => {
    await deleteExamType(id);
  };

  if (loading) {
    return <SkeletonAppointments />;
  }

  return (
    <div className="min-h-screen">
      <div className="p-2 md:p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Agendamentos
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Gerencie consultas, médicos e tipos de exames
            </p>
          </div>
          <Button 
            onClick={() => {
              setSelectedSlotData(null);
              setShowCreateForm(true);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Stats */}
        <AppointmentsStats appointments={appointments} />

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-lg backdrop-blur-sm">
            <CreateAppointmentForm 
              onAppointmentCreated={handleCreateAppointment}
              onClose={handleCloseForm}
              prefilledData={selectedSlotData}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-lg backdrop-blur-sm">
          <AppointmentTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            doctorsCount={doctors.length}
            examTypesCount={examTypes.length}
          >
            {{
              calendar: (
                <AppointmentCalendar
                  appointments={appointments}
                  onSelectAppointment={handleSelectAppointment}
                  onSelectSlot={handleSelectSlot}
                />
              ),
              doctors: (
                <DoctorManagement
                  doctors={doctors}
                  units={units}
                  onCreateDoctor={handleCreateDoctor}
                  onUpdateDoctor={handleUpdateDoctor}
                  onDeleteDoctor={handleDeleteDoctor}
                />
              ),
              examTypes: (
                <ExamTypeManagement
                  examTypes={examTypes}
                  onCreateExamType={handleCreateExamType}
                  onUpdateExamType={handleUpdateExamType}
                  onDeleteExamType={handleDeleteExamType}
                />
              )
            }}
          </AppointmentTabs>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsDashboard;
