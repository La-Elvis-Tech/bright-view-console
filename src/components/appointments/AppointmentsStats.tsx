
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  CalendarClock
} from 'lucide-react';
import { SupabaseAppointment } from '@/types/appointment';
import { format, startOfDay, endOfDay, isAfter, addDays } from 'date-fns';

interface AppointmentsStatsProps {
  appointments: SupabaseAppointment[];
}

const AppointmentsStats: React.FC<AppointmentsStatsProps> = ({ appointments }) => {
  const today = new Date();
  
  // Estatísticas básicas
  const todayAppointments = appointments.filter(app => 
    startOfDay(new Date(app.scheduled_date)) <= today && today <= endOfDay(new Date(app.scheduled_date))
  );
  
  // Próximos agendamentos (hoje e próximos 7 dias)
  const upcomingAppointments = appointments.filter(app => {
    const appointmentDate = new Date(app.scheduled_date);
    const nextWeek = addDays(today, 7);
    return isAfter(appointmentDate, startOfDay(today)) && appointmentDate <= nextWeek && 
           ['Agendado', 'Confirmado'].includes(app.status);
  }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
  
  const totalRevenue = appointments
    .filter(app => app.status === 'Concluído')
    .reduce((sum, app) => sum + (app.cost || 0), 0);
  
  const statusCounts = appointments.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedAppointments = appointments.filter(app => app.status === 'Concluído');
  const averageCost = completedAppointments.length > 0 
    ? totalRevenue / completedAppointments.length 
    : 0;

  const stats = [
    {
      title: "Agendamentos Hoje",
      value: todayAppointments.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Total de Pacientes",
      value: new Set(appointments.map(app => app.patient_name)).size,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/40"
    },
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${averageCost.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/40"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.title}</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status dos Agendamentos */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            <Clock size={18} className="text-blue-600 dark:text-blue-400" />
            Status dos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 p-3 bg-neutral-50/80 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                <Badge 
                  variant="secondary" 
                  className={
                    status === 'Concluído' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                    status === 'Cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                    status === 'Confirmado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                  }
                >
                  {status}
                </Badge>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Agendamentos */}
      {upcomingAppointments.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-200 dark:border-blue-800/50 rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-300">
              <CalendarClock size={18} className="text-blue-600 dark:text-blue-400" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {upcomingAppointments.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-white/70 dark:bg-neutral-900/60 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {appointment.patient_name}
                      </span>
                      <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-700">
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {appointment.exam_types?.name || 'Exame não especificado'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {format(new Date(appointment.scheduled_date), "dd/MM")}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {format(new Date(appointment.scheduled_date), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length > 4 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 text-center mt-2 py-2 bg-white/50 dark:bg-neutral-900/40 rounded-lg">
                  +{upcomingAppointments.length - 4} agendamentos adicionais
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsStats;
