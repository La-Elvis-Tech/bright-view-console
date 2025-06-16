
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmailAlerts } from '@/hooks/useEmailAlerts';

export interface Alert {
  id: string;
  type: 'stock' | 'expiry' | 'forecast' | 'system';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  isRead: boolean;
  status: 'active' | 'resolved';
  createdAt: string;
  item?: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  forecastDate?: string;
  unitId?: string;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { sendStockAlert, sendForecastAlert } = useEmailAlerts();

  const generatePredictionAlerts = async () => {
    try {
      // Buscar itens com consumo alto mas estoque baixo
      const { data: highDemandItems, error } = await supabase
        .from('inventory_items')
        .select('*')
        .lt('current_stock', 100)
        .eq('active', true);

      if (error) throw error;

      const predictionAlerts: Alert[] = highDemandItems?.map(item => ({
        id: `forecast-${item.id}`,
        type: 'forecast' as const,
        title: 'Previsão de Demanda Alta',
        description: `Item ${item.name} pode ter demanda alta nas próximas semanas`,
        priority: 'medium' as const,
        timestamp: new Date().toISOString(),
        resolved: false,
        isRead: false,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        item: item.name,
        currentStock: item.current_stock,
        unit: item.unit_measure,
        forecastDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        unitId: item.unit_id
      })) || [];

      // Enviar alertas por email se habilitado
      for (const alert of predictionAlerts) {
        if (alert.item) {
          await sendForecastAlert({
            item: alert.item,
            predicted_date: alert.forecastDate || '',
            unit_id: alert.unitId
          });
        }
      }

      return predictionAlerts;
    } catch (error) {
      console.error('Erro ao gerar alertas de previsão:', error);
      return [];
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      const stockAlerts = await generateStockAlerts();
      const expiryAlerts = await generateExpiryAlerts();
      const predictionAlerts = await generatePredictionAlerts();
      
      const allAlerts = [...stockAlerts, ...expiryAlerts, ...predictionAlerts];
      
      setAlerts(allAlerts);
      setUnreadCount(allAlerts.filter(alert => !alert.isRead).length);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os alertas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStockAlerts = async () => {
    try {
      const { data: lowStockItems, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('current_stock', 'lte', 'min_stock')
        .eq('active', true);

      if (error) throw error;

      const stockAlerts: Alert[] = lowStockItems?.map(item => ({
        id: `stock-${item.id}`,
        type: 'stock' as const,
        title: 'Estoque Baixo',
        description: `${item.name} está com estoque abaixo do mínimo`,
        priority: item.current_stock === 0 ? 'critical' as const : 'high' as const,
        timestamp: new Date().toISOString(),
        resolved: false,
        isRead: false,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        item: item.name,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        unit: item.unit_measure,
        unitId: item.unit_id
      })) || [];

      // Enviar alertas por email se habilitado
      for (const alert of stockAlerts) {
        const item = lowStockItems?.find(item => item.name === alert.item);
        if (item) {
          await sendStockAlert(item, 'low_stock');
        }
      }

      return stockAlerts;
    } catch (error) {
      console.error('Erro ao gerar alertas de estoque:', error);
      return [];
    }
  };

  const generateExpiryAlerts = async () => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringItems, error } = await supabase
        .from('inventory_items')
        .select('*')
        .lte('expiry_date', thirtyDaysFromNow.toISOString())
        .eq('active', true);

      if (error) throw error;

      const expiryAlerts: Alert[] = expiringItems?.map(item => {
        const expiryDate = new Date(item.expiry_date);
        const today = new Date();
        const isExpired = expiryDate < today;
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: `expiry-${item.id}`,
          type: 'expiry' as const,
          title: isExpired ? 'Item Vencido' : 'Item Próximo ao Vencimento',
          description: isExpired 
            ? `${item.name} venceu em ${expiryDate.toLocaleDateString()}`
            : `${item.name} vence em ${daysUntilExpiry} dias`,
          priority: isExpired ? 'critical' as const : daysUntilExpiry <= 7 ? 'high' as const : 'medium' as const,
          timestamp: new Date().toISOString(),
          resolved: false,
          isRead: false,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          item: item.name,
          expiryDate: item.expiry_date,
          lot: item.lot_number,
          unit: item.unit_measure,
          unitId: item.unit_id
        };
      }) || [];

      // Enviar alertas por email se habilitado
      for (const alert of expiryAlerts) {
        const item = expiringItems?.find(item => item.name === alert.item);
        if (item) {
          const today = new Date();
          const expiryDate = new Date(item.expiry_date);
          const alertType = expiryDate < today ? 'expired' : 'expiring_soon';
          await sendStockAlert(item, alertType);
        }
      }

      return expiryAlerts;
    } catch (error) {
      console.error('Erro ao gerar alertas de vencimento:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Atualizar alertas a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsResolved = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true, status: 'resolved' as const } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsResolved = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, resolved: true, status: 'resolved' as const })));
    setUnreadCount(0);
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    setUnreadCount(0);
  };

  const getUnreadCount = () => {
    return alerts.filter(alert => !alert.isRead).length;
  };

  const sendEmailForAlert = async (alert: Alert) => {
    try {
      if (alert.type === 'stock' && alert.item) {
        const mockItem = {
          name: alert.item,
          current_stock: alert.currentStock || 0,
          min_stock: alert.minStock || 0,
          unit_measure: alert.unit || '',
          expiry_date: alert.expiryDate,
          lot_number: alert.lot,
          unit_id: alert.unitId
        };
        await sendStockAlert(mockItem, 'low_stock');
      } else if (alert.type === 'forecast' && alert.item) {
        await sendForecastAlert({
          item: alert.item,
          predicted_date: alert.forecastDate || '',
          unit_id: alert.unitId
        });
      }
      
      toast({
        title: 'Email enviado',
        description: `Alerta sobre ${alert.item || alert.title} foi enviado por email`,
      });
    } catch (error) {
      console.error('Erro ao enviar alerta por email:', error);
      toast({
        title: 'Erro ao enviar email',
        description: 'Não foi possível enviar o alerta por email.',
        variant: 'destructive',
      });
    }
  };

  return {
    alerts,
    loading,
    unreadCount,
    fetchAlerts,
    markAsResolved,
    markAllAsResolved,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    sendEmailForAlert,
  };
};
