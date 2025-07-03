
-- Temporariamente desabilitar o trigger para inserir dados de exemplo
DROP TRIGGER IF EXISTS trigger_reserve_exam_materials ON public.appointments;

-- 1. Garantir que temos unidades básicas (usando UPSERT mais seguro)
INSERT INTO public.units (name, code, active, address, phone) VALUES
('Unidade Central Lab', 'UC001', true, 'Rua Central, 100 - Centro', '11987654321'),
('Unidade Norte Lab', 'UN002', true, 'Av. Norte, 200 - Zona Norte', '11876543210'),
('Unidade Sul Lab', 'US003', true, 'Rua Sul, 300 - Zona Sul', '11765432109')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone;

-- Atualizar nomes únicos se já existirem
UPDATE public.units 
SET name = 'Unidade Central Lab - ' || code 
WHERE code IN ('UC001', 'UN002', 'US003') 
AND name NOT LIKE '%Lab%';

-- 2. Garantir categorias básicas
INSERT INTO public.inventory_categories (name, description, color, icon) VALUES
('Reagentes Lab', 'Reagentes químicos e biológicos', '#3B82F6', 'flask'),
('Descartáveis Lab', 'Materiais descartáveis e consumíveis', '#EF4444', 'trash'),
('Tubos de Sangue Lab', 'Tubos para coleta de sangue', '#10B981', 'test-tube')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 3. Garantir itens básicos de inventário (com nomes únicos)
INSERT INTO public.inventory_items (
    name, description, sku, current_stock, min_stock, max_stock, 
    cost_per_unit, unit_measure, category_id, unit_id, active, supplier
) 
SELECT 
    'Tubo Seco 5ml - UC001', 'Tubo para coleta sem anticoagulante', 'TUB001-UC', 1000, 50, 2000, 
    2.50, 'unidade', c.id, u.id, true, 'LabSupply'
FROM public.inventory_categories c, public.units u
WHERE c.name = 'Tubos de Sangue Lab' AND u.code = 'UC001'
AND NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Tubo Seco 5ml - UC001');

INSERT INTO public.inventory_items (
    name, description, sku, current_stock, min_stock, max_stock, 
    cost_per_unit, unit_measure, category_id, unit_id, active, supplier
) 
SELECT 
    'Agulha 21G - UC001', 'Agulha descartável 21G', 'AGU001-UC', 2000, 100, 5000, 
    0.80, 'unidade', c.id, u.id, true, 'MedSupply'
FROM public.inventory_categories c, public.units u
WHERE c.name = 'Descartáveis Lab' AND u.code = 'UC001'
AND NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Agulha 21G - UC001');

-- 4. Garantir que temos médicos (com CRM único)
INSERT INTO public.doctors (name, specialty, crm, email, phone, active, unit_id) 
SELECT 'Dr. João Silva Lab', 'Clínico Geral', 'CRM12345-LAB', 'joao.silva.lab@email.com', '11999888777', true, u.id
FROM public.units u
WHERE u.code = 'UC001'
AND NOT EXISTS (SELECT 1 FROM public.doctors WHERE crm = 'CRM12345-LAB');

-- 5. Garantir tipos de exames básicos (com nome único)
INSERT INTO public.exam_types (
    name, description, category, duration_minutes, cost, 
    requires_preparation, preparation_instructions, unit_id, active
) 
SELECT 'Hemograma Completo Lab', 'Exame de sangue completo', 'Hematologia', 30, 25.00, false, NULL, u.id, true
FROM public.units u
WHERE u.code = 'UC001'
AND NOT EXISTS (SELECT 1 FROM public.exam_types WHERE name = 'Hemograma Completo Lab');

-- 6. Relacionar materiais com exames (apenas se ambos existirem)
INSERT INTO public.exam_type_materials (exam_type_id, inventory_item_id, quantity_required, material_type)
SELECT et.id, ii.id, 1, 'blood_tube'
FROM public.exam_types et, public.inventory_items ii
WHERE et.name = 'Hemograma Completo Lab' 
AND ii.name = 'Tubo Seco 5ml - UC001'
AND NOT EXISTS (
    SELECT 1 FROM public.exam_type_materials 
    WHERE exam_type_id = et.id AND inventory_item_id = ii.id
);

-- 7. Adicionar alguns agendamentos históricos (apenas se temos dados necessários)
INSERT INTO public.appointments (
    patient_name, patient_email, patient_phone, exam_type_id, 
    doctor_id, unit_id, scheduled_date, duration_minutes, 
    status, cost, notes, created_by
)
SELECT 
    'Maria Silva Santos', 'maria.silva.santos@email.com', '11987654321',
    et.id, d.id, u.id, NOW() - INTERVAL '10 days', 30, 'Concluído', 25.00,
    'Exame concluído com sucesso', p.id
FROM public.exam_types et, public.doctors d, public.units u, public.profiles p
WHERE et.name = 'Hemograma Completo Lab' 
AND d.crm = 'CRM12345-LAB'
AND u.code = 'UC001'
AND p.status = 'active'
LIMIT 1;

-- 8. Adicionar dados de consumo histórico
INSERT INTO public.consumption_data (
    item_id, unit_id, period_start, period_end, 
    quantity_consumed, total_cost, average_daily_consumption
)
SELECT 
    ii.id, u.id, 
    DATE_TRUNC('week', NOW() - INTERVAL '1 week') as period_start,
    DATE_TRUNC('week', NOW()) - INTERVAL '1 day' as period_end,
    15 as quantity_consumed,
    (15 * ii.cost_per_unit) as total_cost,
    2.14 as average_daily_consumption
FROM public.inventory_items ii, public.units u
WHERE ii.name = 'Tubo Seco 5ml - UC001' AND u.code = 'UC001'
AND NOT EXISTS (
    SELECT 1 FROM public.consumption_data 
    WHERE item_id = ii.id AND unit_id = u.id
);

-- 9. Função de previsão (já existe, apenas garantir que está atualizada)
CREATE OR REPLACE FUNCTION public.calculate_consumption_forecast()
RETURNS TABLE(
    item_id uuid,
    item_name text,
    current_stock integer,
    predicted_weekly_consumption numeric,
    predicted_daily_consumption numeric,
    days_until_shortage integer,
    suggested_reorder_quantity integer,
    confidence_level numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.id as item_id,
        ii.name as item_name,
        ii.current_stock,
        COALESCE(AVG(cd.quantity_consumed), 0)::numeric as predicted_weekly_consumption,
        COALESCE(AVG(cd.average_daily_consumption), 0)::numeric as predicted_daily_consumption,
        CASE 
            WHEN AVG(cd.average_daily_consumption) > 0 THEN 
                FLOOR(ii.current_stock / AVG(cd.average_daily_consumption))::integer
            ELSE 999
        END as days_until_shortage,
        GREATEST(ii.min_stock, 50) as suggested_reorder_quantity,
        70.0::numeric as confidence_level
    FROM public.inventory_items ii
    LEFT JOIN public.consumption_data cd ON ii.id = cd.item_id
    WHERE ii.active = true
    GROUP BY ii.id, ii.name, ii.current_stock, ii.min_stock
    ORDER BY ii.name;
END;
$$;

-- 10. Reativar o trigger
CREATE TRIGGER trigger_reserve_exam_materials
    AFTER INSERT ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.reserve_exam_materials();
