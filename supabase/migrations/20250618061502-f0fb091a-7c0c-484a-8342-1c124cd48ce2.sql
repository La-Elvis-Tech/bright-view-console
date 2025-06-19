
-- Habilitar RLS na tabela appointments se não estiver habilitado
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Política para visualizar agendamentos
-- Usuários podem ver agendamentos da sua unidade, admins/supervisores veem todos
CREATE POLICY "Users can view appointments from their unit" ON public.appointments
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política para criar agendamentos
-- Usuários podem criar agendamentos na sua unidade, admins/supervisores em qualquer unidade
CREATE POLICY "Users can create appointments in their unit" ON public.appointments
  FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política para atualizar agendamentos
CREATE POLICY "Users can update appointments from their unit" ON public.appointments
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política para deletar agendamentos
CREATE POLICY "Users can delete appointments from their unit" ON public.appointments
  FOR DELETE 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Garantir que as outras tabelas também tenham RLS configurado
-- Tabela doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view doctors from their unit" ON public.doctors
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    unit_id IS NULL
  );

-- Tabela exam_types
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exam types from their unit" ON public.exam_types
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor') OR
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    unit_id IS NULL
  );

-- Tabela units - todos podem visualizar para selecionar
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view units" ON public.units
  FOR SELECT 
  TO authenticated
  USING (true);
