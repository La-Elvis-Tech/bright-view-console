import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

export interface ReportData {
  appointments: any[];
  inventory: any[];
  movements: any[];
  alerts: any[];
  units: any[];
}

export const useReportsData = (selectedUnitId?: string) => {
  const { profile, hasRole } = useAuthContext();
  
  // Lógica corrigida: 
  // - Se usuário é admin/supervisor e selectedUnitId = "all", não filtrar por unidade
  // - Se usuário é admin/supervisor e selectedUnitId está definido, usar selectedUnitId
  // - Se usuário comum ou não há selectedUnitId, usar profile.unit_id
  const unitFilter = (hasRole('admin') || hasRole('supervisor')) && selectedUnitId === "all" 
    ? undefined 
    : selectedUnitId || profile?.unit_id;

  return useQuery({
    queryKey: ['reports-data', unitFilter],
    queryFn: async (): Promise<ReportData> => {
      console.log('Buscando dados de relatórios para unidade:', unitFilter);

      try {
        // Buscar agendamentos
        let appointmentsQuery = supabase
          .from('appointments')
          .select(`
            id,
            patient_name,
            scheduled_date,
            cost,
            status,
            created_at,
            exam_types(name, category, cost),
            doctors(name, specialty),
            units(name, code)
          `)
          .order('scheduled_date', { ascending: false })
          .limit(200);

        if (unitFilter) {
          appointmentsQuery = appointmentsQuery.eq('unit_id', unitFilter);
        }

        const { data: appointments, error: appointmentsError } = await appointmentsQuery;
        if (appointmentsError) {
          console.error('Erro ao buscar agendamentos:', appointmentsError);
        }

        // Buscar inventário
        let inventoryQuery = supabase
          .from('inventory_items')
          .select(`
            id,
            name,
            current_stock,
            min_stock,
            cost_per_unit,
            expiry_date,
            created_at,
            inventory_categories(name),
            units(name)
          `)
          .eq('active', true)
          .limit(300);

        if (unitFilter) {
          inventoryQuery = inventoryQuery.eq('unit_id', unitFilter);
        }

        const { data: inventory, error: inventoryError } = await inventoryQuery;
        if (inventoryError) {
          console.error('Erro ao buscar inventário:', inventoryError);
        }

        // Buscar movimentações de estoque - corrigir o filtro de unidade
        const { data: movements, error: movementsError } = await supabase
          .from('inventory_movements')
          .select(`
            id,
            movement_type,
            quantity,
            total_cost,
            created_at,
            reason,
            inventory_items!inner(name, unit_id, inventory_categories(name))
          `)
          .gte('created_at', subMonths(new Date(), 6).toISOString())
          .order('created_at', { ascending: false })
          .limit(300);

        if (movementsError) {
          console.error('Erro ao buscar movimentações:', movementsError);
        }

        // Filtrar movimentações por unidade se necessário
        const filteredMovements = unitFilter && movements
          ? movements.filter(movement => 
              movement.inventory_items?.unit_id === unitFilter
            )
          : movements || [];

        // Buscar alertas - corrigir o filtro de unidade
        const { data: alerts, error: alertsError } = await supabase
          .from('stock_alerts')
          .select(`
            id,
            title,
            alert_type,
            priority,
            status,
            created_at,
            inventory_items!inner(name, unit_id)
          `)
          .order('created_at', { ascending: false })
          .limit(150);

        if (alertsError) {
          console.error('Erro ao buscar alertas:', alertsError);
        }

        // Filtrar alertas por unidade se necessário
        const filteredAlerts = unitFilter && alerts
          ? alerts.filter(alert => 
              alert.inventory_items?.unit_id === unitFilter
            )
          : alerts || [];

        // Buscar unidades (apenas se usuário tem permissão)
        let units = [];
        if (hasRole('admin') || hasRole('supervisor')) {
          const { data: unitsData, error: unitsError } = await supabase
            .from('units')
            .select('*')
            .eq('active', true);

          if (unitsError) {
            console.error('Erro ao buscar unidades:', unitsError);
          } else {
            units = unitsData || [];
          }
        }

        const reportData = {
          appointments: appointments || [],
          inventory: inventory || [],
          movements: filteredMovements,
          alerts: filteredAlerts,
          units: units
        };

        console.log('Dados do relatório carregados:', {
          appointments: reportData.appointments.length,
          inventory: reportData.inventory.length,
          movements: reportData.movements.length,
          alerts: reportData.alerts.length,
          units: reportData.units.length,
          unitFilter
        });

        return reportData;
      } catch (error) {
        console.error('Erro geral ao buscar dados de relatórios:', error);
        return {
          appointments: [],
          inventory: [],
          movements: [],
          alerts: [],
          units: []
        };
      }
    },
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
    retry: 2,
    retryDelay: 1000,
  });
};

export const useReportMetrics = (data: ReportData) => {
  return {
    // Métricas de agendamentos
    appointmentMetrics: {
      total: data.appointments.length,
      thisMonth: data.appointments.filter(app => {
        const date = new Date(app.scheduled_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      completed: data.appointments.filter(app => app.status === 'Concluído').length,
      revenue: data.appointments
        .filter(app => app.status === 'Concluído')
        .reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0),
    },

    // Métricas de inventário
    inventoryMetrics: {
      totalItems: data.inventory.length,
      lowStock: data.inventory.filter(item => item.current_stock <= item.min_stock).length,
      expiringSoon: data.inventory.filter(item => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length,
      totalValue: data.inventory.reduce((sum, item) => 
        sum + (item.current_stock * (item.cost_per_unit || 0)), 0
      )
    },

    // Dados para gráficos
    chartData: {
      weeklyRevenue: calculateWeeklyRevenue(data.appointments),
      appointmentsByType: calculateAppointmentsByType(data.appointments),
      monthlyTrends: calculateMonthlyTrends(data.appointments),
      inventoryByCategory: calculateInventoryByCategory(data.inventory),
      movementsByType: calculateMovementsByType(data.movements)
    }
  };
};

// Funções auxiliares para cálculos - corrigidas para usar dados reais
const calculateWeeklyRevenue = (appointments: any[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayAppointments = appointments.filter(app => {
      const appDate = new Date(app.scheduled_date);
      return appDate.toDateString() === date.toDateString() && app.status === 'Concluído';
    });
    const revenue = dayAppointments.reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0);
    
    return {
      name: format(date, 'dd/MM'),
      value: revenue
    };
  });
  return last7Days;
};

const calculateAppointmentsByType = (appointments: any[]) => {
  const typeCount: { [key: string]: number } = {};
  appointments.forEach(app => {
    const type = app.exam_types?.name || 'Outros';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

const calculateMonthlyTrends = (appointments: any[]) => {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthAppointments = appointments.filter(app => {
      const appDate = new Date(app.scheduled_date);
      return appDate >= monthStart && appDate <= monthEnd;
    });

    const revenue = monthAppointments
      .filter(app => app.status === 'Concluído')
      .reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0);

    return {
      name: format(date, 'MMM'),
      appointments: monthAppointments.length,
      revenue: revenue
    };
  });
  return last6Months;
};

const calculateInventoryByCategory = (inventory: any[]) => {
  const categoryCount: { [key: string]: number } = {};
  inventory.forEach(item => {
    const category = item.inventory_categories?.name || 'Outros';
    categoryCount[category] = (categoryCount[category] || 0) + item.current_stock;
  });

  const total = Object.values(categoryCount).reduce((sum, value) => sum + value, 0);
  
  return Object.entries(categoryCount)
    .map(([name, value]) => ({ 
      name, 
      value: total > 0 ? Math.round((value / total) * 100) : 0 
    }))
    .sort((a, b) => b.value - a.value);
};

const calculateMovementsByType = (movements: any[]) => {
  const typeCount: { [key: string]: number } = {};
  movements.forEach(movement => {
    let type = movement.movement_type;
    // Traduzir os tipos para português
    switch(type) {
      case 'in': type = 'Entrada'; break;
      case 'out': type = 'Saída'; break;
      case 'adjustment': type = 'Ajuste'; break;
      case 'transfer': type = 'Transferência'; break;
      default: type = movement.movement_type;
    }
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};
