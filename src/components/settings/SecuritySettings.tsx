
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import ComplianceSettings from './ComplianceSettings';
import MFASettings from './MFASettings';
import SecurityAuditLogs from './SecurityAuditLogs';

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications: boolean;
  require_password_change: boolean;
  allowed_ip_addresses: string[];
}

const SecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout: 30,
    login_notifications: true,
    require_password_change: false,
    allowed_ip_addresses: [],
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  useEffect(() => {
    const saved = localStorage.getItem('security_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('security_settings', JSON.stringify(settings));
      
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações de segurança foram atualizadas.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 12) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 12 caracteres para compliance.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Log do evento de segurança
      await supabase.from('security_audit_log').insert({
        action_type: 'password_change',
        metadata: { timestamp: new Date().toISOString() },
        risk_level: 'medium'
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Configurações de Segurança
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Gerencie a segurança da sua conta e configurações de compliance
          {profile?.unit?.name && ` na unidade ${profile.unit.name}`}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">

      {/* Change Password */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Key className="h-4 w-4 text-neutral-500" />
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Atualize sua senha regularmente para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Senha Atual
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nova Senha
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
            />
          </div>
          
          <Button 
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardContent>
      </Card>

      {/* Two Factor Authentication */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="h-4 w-4 text-neutral-500" />
            Autenticação de Dois Fatores
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <div>
              <Label htmlFor="two-factor" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Ativar 2FA
              </Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Usar aplicativo autenticador para login
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.two_factor_enabled}
              onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)}
            />
          </div>
          
          {settings.two_factor_enabled && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  2FA Ativado
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Configure seu aplicativo autenticador escaneando o QR Code que aparecerá na próxima tela.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            Configurações de Sessão
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure o comportamento das suas sessões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Timeout da Sessão (minutos)
            </Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={settings.session_timeout}
              onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value) || 30)}
              className="border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg">
            <div>
              <Label htmlFor="login-notifications" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Notificações de Login
              </Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Receber email quando alguém fizer login na sua conta
              </p>
            </div>
            <Switch
              id="login-notifications"
              checked={settings.login_notifications}
              onCheckedChange={(checked) => updateSetting('login_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Alert */}
      <Card className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Último Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Último acesso: Hoje às 14:30 de São Paulo, Brasil
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Se você não reconhece esta atividade, altere sua senha imediatamente.
            </p>
          </div>
        </CardContent>
      </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
        </TabsContent>

        <TabsContent value="mfa">
          <MFASettings />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceSettings />
        </TabsContent>

        <TabsContent value="audit">
          <SecurityAuditLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
