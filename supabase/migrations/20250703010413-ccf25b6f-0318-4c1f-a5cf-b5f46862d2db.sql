-- FASE 1: Infraestrutura Crítica - Otimização de Performance e Índices

-- Criar índices otimizados para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date_unit 
ON appointments(scheduled_date, unit_id) WHERE status != 'Cancelado';

CREATE INDEX IF NOT EXISTS idx_appointments_status_unit_date 
ON appointments(status, unit_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock 
ON inventory_items(unit_id, current_stock) WHERE current_stock <= min_stock;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_date_item 
ON inventory_movements(created_at DESC, item_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date 
ON activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_status_unit 
ON profiles(status, unit_id) WHERE status = 'active';

-- Criar tabela de configurações de sistema para compliance
CREATE TABLE IF NOT EXISTS public.system_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    category TEXT NOT NULL DEFAULT 'security',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    requires_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS na tabela de compliance
ALTER TABLE public.system_compliance ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem configurações de compliance
CREATE POLICY "Admins can manage compliance settings" 
ON public.system_compliance 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Tabela para auditoria de segurança
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'mfa_setup', etc.
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    metadata JSONB,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para auditoria de segurança
CREATE POLICY "Admins can view all security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Tabela para configurações de MFA por usuário
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mfa_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[],
    totp_secret TEXT,
    recovery_email TEXT,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Habilitar RLS na tabela de MFA
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para MFA
CREATE POLICY "Users can manage their own MFA settings" 
ON public.user_mfa_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Inserir configurações padrão de compliance/segurança
INSERT INTO public.system_compliance (setting_key, setting_value, category, description) VALUES
('ssl_enforcement', '{"enabled": true, "min_tls_version": "1.2"}', 'security', 'Configurações de SSL obrigatório'),
('session_security', '{"max_duration": 28800, "idle_timeout": 1800, "require_reauth": true}', 'security', 'Configurações de sessão segura'),
('password_policy', '{"min_length": 12, "require_special": true, "require_numbers": true, "require_uppercase": true, "expire_days": 90}', 'security', 'Política de senhas'),
('login_restrictions', '{"max_attempts": 5, "lockout_duration": 300, "geo_blocking": false}', 'security', 'Restrições de login'),
('audit_settings', '{"retain_days": 365, "log_level": "detailed", "real_time_alerts": true}', 'compliance', 'Configurações de auditoria'),
('hipaa_compliance', '{"enabled": true, "encryption_at_rest": true, "encryption_in_transit": true, "access_logging": true}', 'compliance', 'Configurações HIPAA'),
('lgpd_compliance', '{"enabled": true, "data_retention_days": 1095, "consent_management": true, "right_to_deletion": true}', 'compliance', 'Configurações LGPD')
ON CONFLICT (setting_key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_compliance_updated_at
    BEFORE UPDATE ON public.system_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_user_mfa_settings_updated_at
    BEFORE UPDATE ON public.user_mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();