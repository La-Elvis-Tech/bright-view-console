
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Shield, Key, Clock, AlertTriangle } from 'lucide-react';

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
    // Carregar configurações do localStorage por enquanto
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
      // Salvar no localStorage por enquanto
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

    if (newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Simular mudança de senha por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Segurança</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie a segurança da sua conta
          {profile?.unit?.name && ` na unidade ${profile.unit.name}`}
        </p>
      </div>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Atualize sua senha regularmente para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardContent>
      </Card>

      {/* Autenticação de Dois Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de Dois Fatores
          </CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Ativar 2FA</Label>
              <p className="text-sm text-gray-500">Usar aplicativo autenticador para login</p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.two_factor_enabled}
              onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)}
            />
          </div>
          
          {settings.two_factor_enabled && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Configure seu aplicativo autenticador escaneando o QR Code que aparecerá na próxima tela.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Sessão
          </CardTitle>
          <CardDescription>Configure o comportamento das suas sessões</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={settings.session_timeout}
              onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value) || 30)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="login-notifications">Notificações de Login</Label>
              <p className="text-sm text-gray-500">Receber email quando alguém fizer login na sua conta</p>
            </div>
            <Switch
              id="login-notifications"
              checked={settings.login_notifications}
              onCheckedChange={(checked) => updateSetting('login_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerta de Segurança */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            Último Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Último acesso: Hoje às 14:30 de São Paulo, Brasil
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Se você não reconhece esta atividade, altere sua senha imediatamente.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
