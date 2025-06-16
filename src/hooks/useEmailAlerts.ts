
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertData {
  type: 'stock' | 'expiry' | 'forecast' | 'system';
  title: string;
  description: string;
  item?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  forecastDate?: string;
  unitId?: string;
}

export const useEmailAlerts = () => {
  const { toast } = useToast();

  const sendAlertEmail = async (alertData: AlertData, recipientEmail?: string) => {
    try {
      console.log('Enviando alerta por email via edge function:', alertData);
      
      // Buscar configurações de notificação do usuário
      const notificationPrefs = localStorage.getItem('notification_preferences');
      const prefs = notificationPrefs ? JSON.parse(notificationPrefs) : { email_alerts: true };
      
      // Verificar se o usuário quer receber este tipo de notificação
      if (!prefs.email_alerts) {
        console.log('Usuário optou por não receber alertas por email');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          ...alertData,
          recipientEmail: recipientEmail || 'admin@laelvistech.com',
          timestamp: new Date().toISOString(),
          frequency: prefs.digest_frequency || 'immediate'
        }
      });

      if (error) throw error;

      // Só mostrar toast se a frequência for imediata
      if (prefs.digest_frequency === 'immediate') {
        toast({
          title: 'Alerta enviado',
          description: `Alerta sobre ${alertData.item || alertData.title} foi enviado por email`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao enviar alerta por email:', error);
      toast({
        title: 'Erro ao enviar email',
        description: 'Não foi possível enviar o alerta por email.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const sendStockAlert = async (item: any, type: 'low_stock' | 'expired' | 'expiring_soon') => {
    const alertData: AlertData = {
      type: 'stock',
      title: type === 'low_stock' ? 'Estoque Baixo' : 
             type === 'expired' ? 'Item Vencido' : 'Item Próximo ao Vencimento',
      description: type === 'low_stock' 
        ? `O item ${item.name} está com estoque baixo (${item.current_stock} ${item.unit_measure})`
        : type === 'expired'
        ? `O item ${item.name} está vencido desde ${new Date(item.expiry_date).toLocaleDateString()}`
        : `O item ${item.name} vencerá em breve (${new Date(item.expiry_date).toLocaleDateString()})`,
      item: item.name,
      priority: type === 'expired' ? 'critical' : type === 'expiring_soon' ? 'high' : 'medium',
      currentStock: item.current_stock,
      minStock: item.min_stock,
      unit: item.unit_measure,
      expiryDate: item.expiry_date,
      lot: item.lot_number,
      unitId: item.unit_id
    };

    return sendAlertEmail(alertData);
  };

  const sendForecastAlert = async (forecastData: any) => {
    const alertData: AlertData = {
      type: 'forecast',
      title: 'Previsão de Demanda',
      description: `Previsão indica possível falta de estoque para ${forecastData.item}`,
      item: forecastData.item,
      priority: 'medium',
      forecastDate: forecastData.predicted_date,
      unitId: forecastData.unit_id
    };

    return sendAlertEmail(alertData);
  };

  return { 
    sendAlertEmail, 
    sendStockAlert, 
    sendForecastAlert 
  };
};
