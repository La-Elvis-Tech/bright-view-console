
import React from 'react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentsTable from './AppointmentsTable';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import { adaptSupabaseAppointmentsToAppointments } from '@/utils/appointmentAdapters';

interface AppointmentsTabsProps {
  appointments: SupabaseAppointment[];
  loading: boolean;
  onAppointmentUpdate?: () => void;
}

const AppointmentsTabs: React.FC<AppointmentsTabsProps> = ({
  appointments,
  loading,
  onAppointmentUpdate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Confirmado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Em andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Concluído': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300';
    }
  };

  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const recentAppointments = appointments.filter(appointment => 
    new Date(appointment.scheduled_date) < today
  );

  const next7DaysAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_date);
    return appointmentDate >= today && appointmentDate <= sevenDaysFromNow;
  });

  const restOfMonthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_date);
    return appointmentDate > sevenDaysFromNow && appointmentDate <= endOfCurrentMonth;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="next7days">
      <TabsList className="mb-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <TabsTrigger 
          value="recent"
          className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
        >
          Recentes ({recentAppointments.length})
        </TabsTrigger>
        <TabsTrigger 
          value="next7days"
          className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
        >
          Próximos 7 dias ({next7DaysAppointments.length})
        </TabsTrigger>
        <TabsTrigger 
          value="restOfMonth"
          className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
        >
          Resto do mês ({restOfMonthAppointments.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="recent" className="mt-0">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Agendamentos recentes
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Visualize os agendamentos anteriores à data atual
          </p>
        </div>
        <AppointmentsTable 
          appointments={adaptSupabaseAppointmentsToAppointments(recentAppointments)} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onAppointmentUpdate}
        />
      </TabsContent>
      
      <TabsContent value="next7days" className="mt-0">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Próximos 7 dias ({format(today, "dd/MM")} - {format(sevenDaysFromNow, "dd/MM")})
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Agendamentos da semana atual incluindo hoje
          </p>
        </div>
        <AppointmentsTable 
          appointments={adaptSupabaseAppointmentsToAppointments(next7DaysAppointments)} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onAppointmentUpdate}
        />
      </TabsContent>
      
      <TabsContent value="restOfMonth" className="mt-0">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Resto do mês ({format(new Date(sevenDaysFromNow.getTime() + 86400000), "dd/MM")} - {format(endOfCurrentMonth, "dd/MM")})
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Agendamentos restantes do mês atual
          </p>
        </div>
        <AppointmentsTable 
          appointments={adaptSupabaseAppointmentsToAppointments(restOfMonthAppointments)} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onAppointmentUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentsTabs;
