
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Bell, Mail, AlertTriangle, Package2 } from 'lucide-react';

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

  const notificationItems = [
    {
      id: 'email_appointments',
      title: 'Confirmações de Agendamento',
      description: 'Receba emails sobre agendamentos criados e alterados',
      icon: Bell,
      checked: preferences.email_appointments,
    },
    {
      id: 'email_results',
      title: 'Resultados de Exames',
      description: 'Notificações quando resultados estiverem disponíveis',
      icon: Mail,
      checked: preferences.email_results,
    },
    {
      id: 'email_alerts',
      title: 'Alertas de Estoque',
      description: 'Avisos sobre níveis críticos de estoque',
      icon: AlertTriangle,
      checked: preferences.email_alerts,
    },
    {
      id: 'email_stock_notifications',
      title: 'Notificações de Inventário',
      description: 'Updates sobre movimentações de inventário',
      icon: Package2,
      checked: preferences.email_stock_notifications,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Configurações de Notificação
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Configure como você deseja receber notificações do sistema
          {profile?.unit?.name && ` para a unidade ${profile.unit.name}`}
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            Notificações por Email
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure quais emails você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg">
                  <item.icon className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <Label htmlFor={item.id} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </Label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <Switch
                id={item.id}
                checked={item.checked}
                onCheckedChange={(checked) => updatePreference(item.id as keyof NotificationPreferences, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Frequency */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            Frequência do Resumo
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure com que frequência você deseja receber resumos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <div>
              <Label htmlFor="digest-frequency" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Frequência do Resumo
              </Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Escolha quando receber resumos automáticos
              </p>
            </div>
            <Select
              value={preferences.digest_frequency}
              onValueChange={(value) => updatePreference('digest_frequency', value)}
            >
              <SelectTrigger className="w-40 border-0 bg-white dark:bg-neutral-800 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
              <p><strong>Imediato:</strong> Receba notificações assim que eventos importantes acontecerem</p>
              <p><strong>Diário:</strong> Resumo diário enviado às 8h da manhã</p>
              <p><strong>Semanal:</strong> Resumo semanal enviado todas as segundas-feiras</p>
              <p><strong>Nunca:</strong> Não receber resumos automáticos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
        >
          {loading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
