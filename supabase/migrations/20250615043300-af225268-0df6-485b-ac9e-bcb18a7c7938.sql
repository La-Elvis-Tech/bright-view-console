
-- Remover tabelas não utilizadas de códigos OTP e códigos de convite (agora opcionais)
DROP TABLE IF EXISTS public.otp_codes CASCADE;
DROP TABLE IF EXISTS public.invite_codes CASCADE;

-- Atualizar trigger para definir status 'pending' por padrão para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'pending'  -- Todos os novos usuários começam como pendentes
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remover funções não utilizadas relacionadas a OTP e códigos de convite
DROP FUNCTION IF EXISTS public.generate_otp_code(text, text);
DROP FUNCTION IF EXISTS public.verify_otp_code(text, text, text);
DROP FUNCTION IF EXISTS public.generate_invite_code(uuid, app_role, integer, integer);
DROP FUNCTION IF EXISTS public.validate_invite_code(text);
DROP FUNCTION IF EXISTS public.use_invite_code(text, uuid);

-- Atualizar políticas RLS para profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Criar um usuário administrador de teste
-- Primeiro, vamos inserir diretamente na tabela de usuários auth (isso normalmente seria feito via signup)
-- Como não podemos inserir diretamente em auth.users, vamos criar um perfil admin para o primeiro usuário que se registrar

-- Função para promover o primeiro usuário a admin
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Buscar o primeiro usuário registrado
  SELECT id INTO first_user_id
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Atualizar status para ativo
    UPDATE public.profiles 
    SET status = 'active' 
    WHERE id = first_user_id;
    
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Primeiro usuário promovido a administrador: %', first_user_id;
  END IF;
END;
$$;

-- Executar a função para promover o primeiro usuário
SELECT public.create_first_admin();

-- Adicionar dados de exemplo para categorias de inventário se não existirem
INSERT INTO public.inventory_categories (name, description, color, icon) 
VALUES 
  ('Reagentes', 'Reagentes químicos e biológicos', '#3B82F6', 'flask'),
  ('Vidraria', 'Equipamentos de vidro e plástico', '#10B981', 'beaker'),
  ('Equipamentos', 'Equipamentos médicos e laboratoriais', '#F59E0B', 'cpu'),
  ('Descartáveis', 'Materiais descartáveis e consumíveis', '#EF4444', 'trash')
ON CONFLICT (name) DO NOTHING;

-- Limpar configurações do sistema desnecessárias
DELETE FROM public.system_settings WHERE key IN ('invite_code_required', 'otp_required');

-- Adicionar configuração para aprovação manual de usuários
INSERT INTO public.system_settings (key, value, description, category)
VALUES ('manual_user_approval', 'true', 'Requer aprovação manual de novos usuários', 'auth')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
