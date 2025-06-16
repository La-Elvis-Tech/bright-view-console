
-- Configurar RLS para todas as tabelas que ainda não têm políticas adequadas

-- 1. Políticas para inventory_items (usuários só veem itens da sua unidade)
DROP POLICY IF EXISTS "Users can view inventory of their unit" ON public.inventory_items;
DROP POLICY IF EXISTS "Supervisors can manage inventory" ON public.inventory_items;

CREATE POLICY "Users can view inventory of their unit" ON public.inventory_items
  FOR SELECT TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can manage inventory" ON public.inventory_items
  FOR ALL TO authenticated 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- 2. Políticas para inventory_movements
DROP POLICY IF EXISTS "Users can view movements of their unit" ON public.inventory_movements;
DROP POLICY IF EXISTS "Users can create movements" ON public.inventory_movements;

CREATE POLICY "Users can view movements of their unit" ON public.inventory_movements
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items ii 
      WHERE ii.id = item_id 
      AND ii.unit_id IN (
        SELECT unit_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create movements" ON public.inventory_movements
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = performed_by);

-- 3. Políticas para appointments (usuários só veem agendamentos da sua unidade)
DROP POLICY IF EXISTS "Users can view appointments of their unit" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments;

CREATE POLICY "Users can view appointments of their unit" ON public.appointments
  FOR SELECT TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = created_by AND
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments" ON public.appointments
  FOR UPDATE TO authenticated 
  USING (
    auth.uid() = created_by OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- 4. Políticas para stock_alerts
DROP POLICY IF EXISTS "Users can view alerts of their unit" ON public.stock_alerts;
DROP POLICY IF EXISTS "Supervisors can manage alerts" ON public.stock_alerts;

CREATE POLICY "Users can view alerts of their unit" ON public.stock_alerts
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items ii 
      WHERE ii.id = item_id 
      AND ii.unit_id IN (
        SELECT unit_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Supervisors can manage alerts" ON public.stock_alerts
  FOR ALL TO authenticated 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- 5. Políticas para consumption_data
DROP POLICY IF EXISTS "Users can view consumption of their unit" ON public.consumption_data;
DROP POLICY IF EXISTS "Supervisors can manage consumption data" ON public.consumption_data;

CREATE POLICY "Users can view consumption of their unit" ON public.consumption_data
  FOR SELECT TO authenticated 
  USING (
    unit_id IN (
      SELECT unit_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can manage consumption data" ON public.consumption_data
  FOR ALL TO authenticated 
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- 6. Atualizar política de activity_logs para incluir logs da unidade
DROP POLICY IF EXISTS "Users can view logs of their unit" ON public.activity_logs;
DROP POLICY IF EXISTS "System can create activity logs" ON public.activity_logs;

CREATE POLICY "Users can view their own logs" ON public.activity_logs
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" ON public.activity_logs
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- 7. Adicionar dados iniciais de inventário para testes
INSERT INTO public.inventory_items (
  name, description, category_id, unit_id, current_stock, min_stock, max_stock, 
  unit_measure, cost_per_unit, supplier, storage_location
) 
SELECT 
  'Luvas Descartáveis', 'Luvas de látex descartáveis', 
  (SELECT id FROM inventory_categories WHERE name = 'Descartáveis' LIMIT 1),
  (SELECT id FROM units WHERE code = 'UC' LIMIT 1),
  500, 50, 1000, 'unidade', 0.25, 'MedSupply', 'Armário A1'
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Luvas Descartáveis');

INSERT INTO public.inventory_items (
  name, description, category_id, unit_id, current_stock, min_stock, max_stock, 
  unit_measure, cost_per_unit, supplier, storage_location
) 
SELECT 
  'Seringas 5ml', 'Seringas descartáveis 5ml', 
  (SELECT id FROM inventory_categories WHERE name = 'Descartáveis' LIMIT 1),
  (SELECT id FROM units WHERE code = 'UC' LIMIT 1),
  200, 20, 500, 'unidade', 0.80, 'MedSupply', 'Armário A2'
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Seringas 5ml');

INSERT INTO public.inventory_items (
  name, description, category_id, unit_id, current_stock, min_stock, max_stock, 
  unit_measure, cost_per_unit, supplier, storage_location
) 
SELECT 
  'Álcool 70%', 'Álcool etílico 70% - 1L', 
  (SELECT id FROM inventory_categories WHERE name = 'Reagentes' LIMIT 1),
  (SELECT id FROM units WHERE code = 'UC' LIMIT 1),
  50, 10, 100, 'litro', 12.50, 'ChemCorp', 'Armário B1'
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Álcool 70%');
