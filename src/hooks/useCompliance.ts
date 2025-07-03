import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplianceSettings {
  ssl_enforcement: {
    enabled: boolean;
    min_tls_version: string;
  };
  session_security: {
    max_duration: number;
    idle_timeout: number;
    require_reauth: boolean;
  };
  password_policy: {
    min_length: number;
    require_special: boolean;
    require_numbers: boolean;
    require_uppercase: boolean;
    expire_days: number;
  };
  login_restrictions: {
    max_attempts: number;
    lockout_duration: number;
    geo_blocking: boolean;
  };
  audit_settings: {
    retain_days: number;
    log_level: string;
    real_time_alerts: boolean;
  };
  hipaa_compliance: {
    enabled: boolean;
    encryption_at_rest: boolean;
    encryption_in_transit: boolean;
    access_logging: boolean;
  };
  lgpd_compliance: {
    enabled: boolean;
    data_retention_days: number;
    consent_management: boolean;
    right_to_deletion: boolean;
  };
}

export const useCompliance = () => {
  const [settings, setSettings] = useState<Partial<ComplianceSettings>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_compliance')
        .select('setting_key, setting_value')
        .in('category', ['security', 'compliance']);

      if (error) throw error;

      const parsedSettings: Partial<ComplianceSettings> = {};
      data?.forEach((item) => {
        parsedSettings[item.setting_key as keyof ComplianceSettings] = item.setting_value as any;
      });

      setSettings(parsedSettings);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof ComplianceSettings, value: any) => {
    try {
      const { error } = await supabase
        .from('system_compliance')
        .update({
          setting_value: value,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));

      toast({
        title: 'Configuração atualizada',
        description: 'A configuração de compliance foi salva com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const logSecurityEvent = async (action: string, metadata?: any, riskLevel = 'low') => {
    try {
      const user = await supabase.auth.getUser();
      
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: user.data.user?.id,
          action_type: action,
          ip_address: metadata?.ip_address,
          user_agent: navigator.userAgent,
          session_id: metadata?.session_id,
          metadata: metadata,
          risk_level: riskLevel,
        });
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    logSecurityEvent,
    refreshSettings: fetchSettings,
  };
};