
-- Tabela para códigos de convite
CREATE TABLE public.invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    used_by UUID REFERENCES auth.users(id),
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    role app_role DEFAULT 'user',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ
);

-- Tabela para códigos OTP
CREATE TABLE public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('login', 'signup', 'password_reset')),
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invite_codes
CREATE POLICY "Admins can manage invite codes" ON public.invite_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own invite usage" ON public.invite_codes
  FOR SELECT USING (auth.uid() = used_by);

-- Políticas RLS para otp_codes
CREATE POLICY "Users can view their own OTP codes" ON public.otp_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage OTP codes" ON public.otp_codes
  FOR ALL TO authenticated USING (true);

-- Função para gerar códigos de convite
CREATE OR REPLACE FUNCTION public.generate_invite_code(
  p_created_by UUID,
  p_role app_role DEFAULT 'user',
  p_max_uses INTEGER DEFAULT 1,
  p_expires_hours INTEGER DEFAULT 168 -- 7 dias
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Verificar se o usuário tem permissão para criar códigos
  IF NOT public.has_role(p_created_by, 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem criar códigos de convite';
  END IF;
  
  -- Gerar código único
  v_code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'base64') FROM 1 FOR 8));
  
  -- Inserir código
  INSERT INTO public.invite_codes (
    code, 
    created_by, 
    role, 
    max_uses, 
    expires_at
  ) VALUES (
    v_code,
    p_created_by,
    p_role,
    p_max_uses,
    NOW() + INTERVAL '1 hour' * p_expires_hours
  );
  
  RETURN v_code;
END;
$$;

-- Função para validar código de convite
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_result JSONB;
BEGIN
  -- Buscar código
  SELECT * INTO v_invite
  FROM public.invite_codes
  WHERE code = p_code
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Código inválido, expirado ou já utilizado'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'role', v_invite.role,
    'invite_id', v_invite.id
  );
END;
$$;

-- Função para usar código de convite
CREATE OR REPLACE FUNCTION public.use_invite_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Buscar e atualizar código
  UPDATE public.invite_codes
  SET 
    current_uses = current_uses + 1,
    used_by = p_user_id,
    used_at = NOW()
  WHERE code = p_code
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses
  RETURNING * INTO v_invite;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar role do usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, v_invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Desativar código se atingiu o limite
  IF v_invite.current_uses >= v_invite.max_uses THEN
    UPDATE public.invite_codes
    SET is_active = FALSE
    WHERE id = v_invite.id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Função para gerar código OTP
CREATE OR REPLACE FUNCTION public.generate_otp_code(
  p_email TEXT,
  p_type TEXT DEFAULT 'login'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_user_id UUID;
BEGIN
  -- Gerar código de 6 dígitos
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Buscar user_id se existir
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- Invalidar códigos anteriores
  UPDATE public.otp_codes
  SET expires_at = NOW()
  WHERE email = p_email
    AND type = p_type
    AND expires_at > NOW();
  
  -- Inserir novo código
  INSERT INTO public.otp_codes (
    user_id,
    email,
    code,
    type,
    expires_at
  ) VALUES (
    v_user_id,
    p_email,
    v_code,
    p_type,
    NOW() + INTERVAL '10 minutes'
  );
  
  RETURN v_code;
END;
$$;

-- Função para verificar código OTP
CREATE OR REPLACE FUNCTION public.verify_otp_code(
  p_email TEXT,
  p_code TEXT,
  p_type TEXT DEFAULT 'login'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp RECORD;
BEGIN
  -- Buscar código
  SELECT * INTO v_otp
  FROM public.otp_codes
  WHERE email = p_email
    AND code = p_code
    AND type = p_type
    AND expires_at > NOW()
    AND verified = FALSE
    AND attempts < max_attempts;
  
  IF NOT FOUND THEN
    -- Incrementar tentativas se código existe
    UPDATE public.otp_codes
    SET attempts = attempts + 1
    WHERE email = p_email
      AND code = p_code
      AND type = p_type
      AND expires_at > NOW();
    
    RETURN FALSE;
  END IF;
  
  -- Marcar como verificado
  UPDATE public.otp_codes
  SET 
    verified = TRUE,
    verified_at = NOW()
  WHERE id = v_otp.id;
  
  RETURN TRUE;
END;
$$;

-- Inserir alguns códigos de convite iniciais para teste
INSERT INTO public.invite_codes (code, created_by, role, max_uses, expires_at)
SELECT 
  'ADMIN001',
  (SELECT id FROM auth.users LIMIT 1),
  'admin',
  1,
  NOW() + INTERVAL '30 days'
WHERE EXISTS (SELECT 1 FROM auth.users);

INSERT INTO public.invite_codes (code, created_by, role, max_uses, expires_at)
SELECT 
  'USER001',
  (SELECT id FROM auth.users LIMIT 1),
  'user',
  10,
  NOW() + INTERVAL '30 days'
WHERE EXISTS (SELECT 1 FROM auth.users);
