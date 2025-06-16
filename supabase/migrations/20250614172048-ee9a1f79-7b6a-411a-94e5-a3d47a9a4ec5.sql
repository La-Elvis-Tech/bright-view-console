
-- =====================================================
-- FASE 1: SISTEMA DE AUTENTICAÇÃO E PERFIS
-- =====================================================

-- Enum para roles do sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'supervisor');

-- Enum para status de usuário
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'pending');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT,
    department TEXT,
    unit_id UUID,
    phone TEXT,
    avatar_url TEXT,
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- =====================================================
-- FASE 2: ESTRUTURA DO SISTEMA LABORATORIAL
-- =====================================================

-- Tabela de unidades DASA
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    manager_id UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de inventário
CREATE TABLE public.inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens de inventário
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.inventory_categories(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    sku TEXT UNIQUE,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit_measure TEXT NOT NULL, -- ml, g, unidade, etc
    cost_per_unit DECIMAL(10,2),
    supplier TEXT,
    storage_location TEXT,
    expiry_date DATE,
    lot_number TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentações de estoque
CREATE TABLE public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason TEXT,
    reference_id UUID, -- pode referenciar agendamento, pedido, etc
    reference_type TEXT,
    performed_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Médicos e responsáveis
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT,
    crm TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    unit_id UUID REFERENCES public.units(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de exames
CREATE TABLE public.exam_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    duration_minutes INTEGER,
    cost DECIMAL(10,2),
    requires_preparation BOOLEAN DEFAULT FALSE,
    preparation_instructions TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    exam_type_id UUID REFERENCES public.exam_types(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Em andamento', 'Concluído', 'Cancelado')),
    cost DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumo de materiais por agendamento
CREATE TABLE public.appointment_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
    quantity_used INTEGER NOT NULL,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alertas de estoque
CREATE TABLE public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'expiry', 'out_of_stock')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    threshold_value INTEGER,
    current_value INTEGER,
    expiry_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados de consumo para analytics
CREATE TABLE public.consumption_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    quantity_consumed INTEGER NOT NULL,
    total_cost DECIMAL(10,2),
    average_daily_consumption DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de atividade para auditoria
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações do sistema
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNÇÕES DE SEGURANÇA E UTILIDADE
-- =====================================================

-- Função para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'supervisor' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Trigger para criar perfil automaticamente
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
    'active'
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para criar perfil quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas gerais para tabelas principais (acesso baseado em role)
CREATE POLICY "Authenticated users can view units" ON public.units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage units" ON public.units
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view categories" ON public.inventory_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.inventory_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage inventory" ON public.inventory_items
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Authenticated users can view movements" ON public.inventory_movements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create movements" ON public.inventory_movements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = performed_by);

CREATE POLICY "Authenticated users can view doctors" ON public.doctors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view exam types" ON public.exam_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage exam types" ON public.exam_types
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Authenticated users can view appointment inventory" ON public.appointment_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage appointment inventory" ON public.appointment_inventory
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Authenticated users can view alerts" ON public.stock_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can manage alerts" ON public.stock_alerts
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view consumption data" ON public.consumption_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can manage consumption data" ON public.consumption_data
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir categorias de inventário
INSERT INTO public.inventory_categories (name, description, color, icon) VALUES
('Reagentes', 'Reagentes químicos e biológicos', '#3B82F6', 'flask'),
('Vidraria', 'Equipamentos de vidro e plástico', '#10B981', 'beaker'),
('Equipamentos', 'Equipamentos médicos e laboratoriais', '#F59E0B', 'cpu'),
('Descartáveis', 'Materiais descartáveis e consumíveis', '#EF4444', 'trash');

-- Inserir unidades DASA
INSERT INTO public.units (name, code, address, phone, active) VALUES
('Unidade Centro', 'UC', 'Rua das Flores, 123 - Centro', '(11) 1234-5678', true),
('Unidade Norte', 'UN', 'Av. Norte, 456 - Zona Norte', '(11) 2345-6789', true),
('Unidade Sul', 'US', 'Rua Sul, 789 - Zona Sul', '(11) 3456-7890', true),
('Unidade Leste', 'UL', 'Av. Leste, 321 - Zona Leste', '(11) 4567-8901', true),
('Unidade Oeste', 'UO', 'Rua Oeste, 654 - Zona Oeste', '(11) 5678-9012', true);

-- Inserir tipos de exames
INSERT INTO public.exam_types (name, category, description, duration_minutes, cost, requires_preparation) VALUES
('Coleta de Sangue', 'Laboratorial', 'Coleta de sangue para análises diversas', 15, 25.00, false),
('Ultrassom', 'Imagem', 'Exame de ultrassonografia', 30, 120.00, true),
('Raio-X', 'Imagem', 'Radiografia simples', 20, 80.00, false),
('Eletrocardiograma', 'Cardiológico', 'ECG de repouso', 15, 45.00, false),
('Tomografia', 'Imagem', 'Tomografia computadorizada', 45, 350.00, true),
('Mamografia', 'Imagem', 'Exame mamográfico', 25, 150.00, false),
('Colonoscopia', 'Endoscópico', 'Exame endoscópico do cólon', 60, 400.00, true),
('Densitometria', 'Imagem', 'Densitometria óssea', 30, 180.00, false);

-- Inserir médicos
INSERT INTO public.doctors (name, specialty, crm, email, phone, unit_id) VALUES
('Dra. Ana Souza', 'Cardiologia', 'CRM-SP 123456', 'ana.souza@dasa.com', '(11) 9999-1111', (SELECT id FROM public.units WHERE code = 'UC')),
('Dr. Carlos Mendes', 'Radiologia', 'CRM-SP 234567', 'carlos.mendes@dasa.com', '(11) 9999-2222', (SELECT id FROM public.units WHERE code = 'UN')),
('Dra. Lucia Freitas', 'Laboratório', 'CRM-SP 345678', 'lucia.freitas@dasa.com', '(11) 9999-3333', (SELECT id FROM public.units WHERE code = 'US')),
('Dr. Roberto Castro', 'Endoscopia', 'CRM-SP 456789', 'roberto.castro@dasa.com', '(11) 9999-4444', (SELECT id FROM public.units WHERE code = 'UL')),
('Dra. Fernanda Lima', 'Ginecologia', 'CRM-SP 567890', 'fernanda.lima@dasa.com', '(11) 9999-5555', (SELECT id FROM public.units WHERE code = 'UO'));

-- Inserir configurações do sistema
INSERT INTO public.system_settings (key, value, description, category) VALUES
('low_stock_threshold', '{"default": 10, "critical": 5}', 'Limites padrão para alertas de estoque baixo', 'inventory'),
('expiry_alert_days', '{"warning": 30, "critical": 7}', 'Dias antes do vencimento para alertas', 'inventory'),
('default_appointment_duration', '30', 'Duração padrão de agendamentos em minutos', 'appointments'),
('system_name', '"Sistema DASA Labs"', 'Nome do sistema', 'general'),
('maintenance_mode', 'false', 'Modo de manutenção do sistema', 'general');
