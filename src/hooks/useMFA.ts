import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MFASettings {
  mfa_enabled: boolean;
  backup_codes: string[];
  totp_secret: string;
  recovery_email: string;
  last_used_at: string;
}

export const useMFA = () => {
  const [mfaSettings, setMfaSettings] = useState<Partial<MFASettings>>({});
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  const fetchMFASettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMfaSettings(data);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar MFA',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTOTPSecret = () => {
    // Simular geração de secret TOTP (em produção, usar biblioteca específica)
    const secret = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');
    
    return secret;
  };

  const generateBackupCodes = () => {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  };

  const enableMFA = async (recoveryEmail?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const totpSecret = generateTOTPSecret();
      const backupCodes = generateBackupCodes();

      // Gerar QR Code URL (em produção, usar biblioteca específica)
      const issuer = 'DASA Labs';
      const label = user.email;
      const qrUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}`;
      setQrCodeUrl(qrUrl);

      const { error } = await supabase
        .from('user_mfa_settings')
        .upsert({
          user_id: user.id,
          mfa_enabled: true,
          backup_codes: backupCodes,
          totp_secret: totpSecret,
          recovery_email: recoveryEmail || user.email,
        });

      if (error) throw error;

      setMfaSettings({
        mfa_enabled: true,
        backup_codes: backupCodes,
        totp_secret: totpSecret,
        recovery_email: recoveryEmail || user.email,
      });

      toast({
        title: 'MFA Ativado',
        description: 'Autenticação de dois fatores foi configurada com sucesso.',
      });

      return { secret: totpSecret, backupCodes, qrUrl };
    } catch (error: any) {
      toast({
        title: 'Erro ao ativar MFA',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_mfa_settings')
        .update({
          mfa_enabled: false,
          totp_secret: null,
          backup_codes: [],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setMfaSettings(prev => ({
        ...prev,
        mfa_enabled: false,
        totp_secret: '',
        backup_codes: [],
      }));

      toast({
        title: 'MFA Desativado',
        description: 'Autenticação de dois fatores foi desabilitada.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao desativar MFA',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async (token: string) => {
    // Em produção, implementar verificação real do token TOTP
    const isValid = token.length === 6 && /^\d+$/.test(token);
    
    if (isValid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_mfa_settings')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    }
    
    return isValid;
  };

  useEffect(() => {
    fetchMFASettings();
  }, []);

  return {
    mfaSettings,
    loading,
    qrCodeUrl,
    enableMFA,
    disableMFA,
    verifyTOTP,
    refreshSettings: fetchMFASettings,
  };
};