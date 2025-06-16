
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

interface NotificationPreferences {
  email_appointments: boolean;
  email_results: boolean;
  email_alerts: boolean;
  email_stock_notifications: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_appointments: true,
    email_results: true,
    email_alerts: true,
    email_stock_notifications: true,
    digest_frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  useEffect(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      
      toast({
        title: 'Preferências salvas',
        description: 'Suas configurações de notificação foram atualizadas.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as preferências.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Notificação</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure como você deseja receber notificações do sistema
          {profile?.unit?.name && ` para a unidade ${profile.unit.name}`}
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações por Email</CardTitle>
          <CardDescription>Configure quais emails você deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-appointments">Confirmações de Agendamento</Label>
            <Switch
              id="email-appointments"
              checked={preferences.email_appointments}
              onCheckedChange={(checked) => updatePreference('email_appointments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-results">Resultados de Exames</Label>
            <Switch
              id="email-results"
              checked={preferences.email_results}
              onCheckedChange={(checked) => updatePreference('email_results', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-alerts">Alertas de Estoque</Label>
            <Switch
              id="email-alerts"
              checked={preferences.email_alerts}
              onCheckedChange={(checked) => updatePreference('email_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-stock">Notificações de Inventário</Label>
            <Switch
              id="email-stock"
              checked={preferences.email_stock_notifications}
              onCheckedChange={(checked) => updatePreference('email_stock_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Frequência do Resumo</CardTitle>
          <CardDescription>Configure com que frequência você deseja receber resumos do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-frequency">Frequência do Resumo</Label>
            <Select
              value={preferences.digest_frequency}
              onValueChange={(value) => updatePreference('digest_frequency', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p><strong>Imediato:</strong> Receba notificações assim que eventos importantes acontecerem</p>
            <p><strong>Diário:</strong> Resumo diário enviado às 8h da manhã</p>
            <p><strong>Semanal:</strong> Resumo semanal enviado todas as segundas-feiras</p>
            <p><strong>Nunca:</strong> Não receber resumos automáticos</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
