
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RiskAlertsCard: React.FC = () => {
  const { data: expiringItems } = useQuery({
    queryKey: ['expiring-items'],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('inventory_items')
        .select('name, expiry_date, lot_number')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .eq('active', true)
        .order('expiry_date')
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: pendingAppointments } = useQuery({
    queryKey: ['pending-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_name, scheduled_date, status')
        .in('status', ['Agendado', 'Confirmado'])
        .order('scheduled_date')
        .limit(3);

      if (error) throw error;
      return data || [];
    }
  });

  const getExpiryUrgencyColor = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
    if (days <= 15) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300";
    return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Agendamentos Pendentes */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            Agendamentos Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pendingAppointments?.length || 0}
              </span>
              <Link 
                to="/appointments" 
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Ver Agenda
              </Link>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingAppointments?.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-neutral-950/80 rounded-lg text-sm">
                  <span className="truncate text-gray-800 dark:text-gray-200">{appointment.patient_name}</span>
                  <Badge className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                    {new Date(appointment.scheduled_date).toLocaleDateString('pt-BR')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vencimentos */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Clock size={18} className="text-orange-600 dark:text-orange-400" />
            Vencimentos (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-950/40 dark:to-yellow-950/40 rounded-xl border border-orange-200 dark:border-orange-900/50">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {expiringItems?.length || 0}
              </span>
              <Link 
                to="/inventory?filter=expiring" 
                className="text-sm text-orange-600 hover:underline font-medium"
              >
                Ver Todos
              </Link>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expiringItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-neutral-950/80 rounded-lg text-sm">
                  <span className="truncate text-gray-800 dark:text-gray-200">{item.name}</span>
                  <Badge className={getExpiryUrgencyColor(item.expiry_date)}>
                    {getDaysUntilExpiry(item.expiry_date)}d
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAlertsCard;
