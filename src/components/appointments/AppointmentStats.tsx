
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { format, startOfDay, endOfDay } from 'date-fns';

interface AppointmentStatsProps {
  appointments: Appointment[];
}

const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments }) => {
  const today = new Date();
  
  // Estatísticas básicas
  const todayAppointments = appointments.filter(app => 
    startOfDay(new Date(app.date)) <= today && today <= endOfDay(new Date(app.date))
  );
  
  const totalRevenue = appointments
    .filter(app => app.status === 'Concluído')
    .reduce((sum, app) => sum + app.cost, 0);
  
  const statusCounts = appointments.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageCost = appointments.length > 0 
    ? totalRevenue / appointments.filter(app => app.status === 'Concluído').length 
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
      value: new Set(appointments.map(app => app.patient)).size,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/40"
    },
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
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
            <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
            Status dos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
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

      {/* Alertas de Agendamentos */}
      {todayAppointments.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-200 dark:border-amber-800/50 rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              Agendamentos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 bg-white/60 dark:bg-neutral-900/60 rounded-lg">
                  <div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {appointment.patient}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
                      - {appointment.type}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {format(new Date(appointment.date), "HH:mm")}
                  </span>
                </div>
              ))}
              {todayAppointments.length > 3 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                  +{todayAppointments.length - 3} agendamentos adicionais hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentStats;
