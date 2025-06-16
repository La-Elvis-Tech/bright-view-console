import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Plus } from 'lucide-react';
import AppointmentCalendar from './AppointmentCalendar';
import CreateAppointmentForm from './CreateAppointmentForm';
import DoctorManagement from './DoctorManagement';
import ExamTypeManagement from './ExamTypeManagement';
import AppointmentsStats from './AppointmentsStats';
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
    createAppointment,
    updateAppointment,
    deleteAppointment,
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

  // Wrap the functions to match expected interface
  const handleCreateDoctor = async (doctorData: any) => {
    await createDoctor(doctorData);
  };

  const handleUpdateDoctor = async (id: string, updates: any) => {
    await updateDoctor(id, updates);
  };

  const handleDeleteDoctor = async (id: string) => {
    await deleteDoctor(id);
  };

  const handleCreateExamType = async (examTypeData: any) => {
    await createExamType(examTypeData);
  };

  const handleUpdateExamType = async (id: string, updates: any) => {
    await updateExamType(id, updates);
  };

  const handleDeleteExamType = async (id: string) => {
    await deleteExamType(id);
  };

  if (loading) {
    return <SkeletonAppointments />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Sistema de Agendamentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Gerencie agendamentos, médicos e tipos de exames
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedSlotData(null);
            setShowCreateForm(true);
          }}
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <AppointmentsStats appointments={appointments} />

      {showCreateForm && (
        <CreateAppointmentForm 
          onAppointmentCreated={handleCreateAppointment}
          onClose={handleCloseForm}
          prefilledData={selectedSlotData}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger 
            value="doctors"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Médicos ({doctors.length})
          </TabsTrigger>
          <TabsTrigger 
            value="exam-types"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 text-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Tipos de Exames ({examTypes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <AppointmentCalendar
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            onSelectSlot={handleSelectSlot}
          />
        </TabsContent>

        <TabsContent value="doctors">
          <DoctorManagement
            doctors={doctors}
            units={units}
            onCreateDoctor={handleCreateDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        </TabsContent>

        <TabsContent value="exam-types">
          <ExamTypeManagement
            examTypes={examTypes}
            onCreateExamType={handleCreateExamType}
            onUpdateExamType={handleUpdateExamType}
            onDeleteExamType={handleDeleteExamType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsDashboard;
